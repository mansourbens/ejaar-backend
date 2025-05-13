import {Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Patch, Post, Res} from '@nestjs/common';
import {QuotationsService} from './quotations.service';
import {CreateQuotationDto} from './dto/create-quotation.dto';
import {UpdateQuotationDto} from './dto/update-quotation.dto';
import {Response} from 'express';
import PdfPrinter from 'pdfmake';
import {TDocumentDefinitions} from "pdfmake/interfaces";
import {join} from "path"; // Make sure this import is here
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {Quotation} from "./entities/quotation.entity";
import {UsersService} from "../users/users.service";
import {SuppliersService} from "../suppliers/suppliers.service";
import {QuotationStatusEnum} from "./enums/quotation-status.enum";
import {RateConfigService} from "../rate-config/rate-config.service";
import {ResidualConfigService} from "../residual-config/residual-config.service";
import {calculateResidualValue, performCalculations} from "./calculations";

@Controller('quotations')
export class QuotationsController {
    constructor(private readonly quotationsService: QuotationsService,
                private readonly usersService: UsersService,
                private readonly supplierService: SuppliersService,
                private readonly rateConfigService: RateConfigService,
                private readonly residualConfigService: ResidualConfigService,
    ) {
    }

    @Post()
    create(@Body() createQuotationDto: CreateQuotationDto) {
        return this.quotationsService.create(createQuotationDto);
    }

    @Get()
    findAll() {
        return this.quotationsService.findAll();
    }


    @Get('template')
    downloadTemplate(@Res() res: Response) {
        const filePath = '/var/opt/ejaar/templates/template_materiel_devis.xlsx';

        // 3. Check if file exists
        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found on server');
        }

        // 4. Send the file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="materiel_devis"`
        );
        res.sendFile(filePath);
    }

    @Get('/to-bank/:id')
    sendToBank(@Param('id') id: string) {
        return this.quotationsService.sendToBank(+id);
    }

    @Get('/validate-folder/:id')
    validateFolder(@Param('id') id: string) {
        return this.quotationsService.validateFolder(+id);
    }

    @Get('/to-verification/:id')
    sendToVerification(@Param('id') id: string) {
        return this.quotationsService.sendToVerification(+id);
    }

    @Get('/client/:clientId')
    findAllByClient(@Param('clientId') clientId: string) {
        return this.quotationsService.findAllByClient(clientId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.quotationsService.findOne(+id);
    }

    @Patch('/reject/:id')
    reject(@Param('id') id: string, @Body() body: { reason: string }) {
        return this.quotationsService.reject(+id, body.reason);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateQuotationDto: UpdateQuotationDto) {
        return this.quotationsService.update(+id, updateQuotationDto);
    }


    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.quotationsService.remove(+id);
    }

    @Post('generate')
    async generateQuotation(@Body() formData: CreateQuotationDto, @Res() res: Response) {
        const quotation = new Quotation();
        const client = await this.usersService.findById(formData.clientId);
        const supplier = await this.supplierService.findOne(formData.supplierId);

        if (client) {
            quotation.client = client;
        }
        if (supplier) {
            quotation.supplier = supplier;
        }
        const fonts = {
            Roboto: {
                normal: join('src', 'assets', 'fonts', 'Roboto-Regular.ttf'),
                bold: join('src', 'assets', 'fonts', 'Roboto-Bold.ttf'),
                italics: join('src', 'assets', 'fonts', 'Roboto-Italic.ttf'),
            },
        };
        const printer = new PdfPrinter(fonts);

        quotation.status = QuotationStatusEnum.GENERE;
        quotation.createdAt = new Date();
        quotation.number = this.quotationsService.generateUniqueNumber();
        quotation.devices = formData.devices.map(dev => dev.type).join(',');

        // Load necessary configurations
        const [tauxResponse, residualResponse] = await Promise.all([
            this.rateConfigService.findAll(),
            this.residualConfigService.findAll()
        ]);

        const tauxLoyerConfig = await this.rateConfigService.findAll();
        const residualConfig = await this.residualConfigService.findAll();

        const tauxMap = tauxLoyerConfig.reduce((acc, curr) => {
            acc[curr.categorieCA] = {
                tauxBanque: curr.tauxBanque,
                spread: curr.spread,
            };
            return acc;
        }, {});

        const residualMap = residualConfig.reduce((acc, curr) => {
            acc[curr.device] = {
                months24: curr.months24,
                months36: curr.months36,
            };
            return acc;
        }, {});

        console.log(residualMap, tauxMap);

        // Group devices by duration
        const devices24Months = formData.devices.filter(device => device.duration === '24');
        const devices36Months = formData.devices.filter(device => device.duration === '36');

        console.log(formData);
        console.log(devices24Months);
        console.log(devices36Months);
        // Calculate leasing details for each group
        const calculateGroupDetails = (devices: any[], duration: number) => {
            let totalAmount = 0;
            let totalMonthlyPayment = 0;
            let totalResidualValue = 0;

            const deviceRows = devices.map(device => {
                const amount = device.unitCost * device.units;
                totalAmount += amount;

                const residualValuePercentage = residualMap[device.type][`months${duration}`];
                let spread = 0;
                let leasingRate = 0;
                if (client) {
                    spread = tauxMap[client.caCategory].spread;
                    leasingRate = tauxMap[client.caCategory].tauxBanque;
                }

                const calculations = performCalculations(
                    amount,
                    duration,
                    parseFloat(residualValuePercentage),
                    +spread,
                    +leasingRate
                );
                totalMonthlyPayment += calculations.monthlyPayment;
                totalResidualValue += calculateResidualValue(amount, residualValuePercentage);

                return [
                    {text: device.type, style: 'tableText'},
                    {text: device.reference || '-', style: 'tableText'},
                    {text: device.designation || '-', style: 'tableText'},
                    {text: device.units.toString(), style: 'tableText'},
                    {text: device.unitCost.toFixed(0) + ' DH', style: 'tableText'},
                    {text: calculations.monthlyPayment.toFixed(0) + ' DH', style: 'tableText'},
                ];
            });

            return {
                deviceRows,
                totalAmount,
                totalMonthlyPayment,
                totalResidualValue,
                totalLeasingCost: totalMonthlyPayment * duration
            };
        };

        const details24Months = calculateGroupDetails(devices24Months, 24);
        const details36Months = calculateGroupDetails(devices36Months, 36);

        // Calculate purchase option (residual value + 2%)
        const calculatePurchaseOption = (devices: any[], duration: number) => {
            return devices.reduce((sum, device) => {
                const residualPercentage = +residualMap[device.type][`months${duration}`] + 2;
                return sum + (device.unitCost * device.units * residualPercentage) / 100;
            }, 0);
        };

        const purchaseOption24 = devices24Months.length > 0 ? calculatePurchaseOption(devices24Months, 24) : 0;
        const purchaseOption36 = devices36Months.length > 0 ? calculatePurchaseOption(devices36Months, 36) : 0;
        const totalPurchaseOption = purchaseOption24 + purchaseOption36;

        // Calculate totals
        const totalFinancedAmount = (details24Months?.totalAmount || 0) + (details36Months?.totalAmount || 0);
        const totalMonthlyPayments = (details24Months?.totalMonthlyPayment || 0) + (details36Months?.totalMonthlyPayment || 0);
        const totalLeasingCost = (details24Months?.totalLeasingCost || 0) + (details36Months?.totalLeasingCost || 0);
        const totalOperationCost = totalLeasingCost + totalPurchaseOption;

        quotation.amount = totalFinancedAmount;

        const docDefinition: any = {
            content: [
                // Header section
                {
                    image: join('src', 'assets', 'images', 'ejaar_logo_v2.png'),
                    width: 100,
                    alignment: 'left',
                    margin: [0, 0, 0, 5]
                },
                {
                    text: 'DEVIS DE LOCATION',
                    style: 'header',
                },
                {
                    text: 'EJAAR - Détails du devis de location',
                    style: 'subheader',
                },
                {
                    text: 'Informations sur votre entreprise',
                    style: 'infoHeader',
                },
                {
                    columns: [
                        {
                            text: [
                                'EJAAR\n',
                                '1234 rue fictive, Ville\n',
                                'Téléphone: 01 23 45 67 89\n',
                                'Email: contact@ejaar.com\n',
                                'ICE: 123 456 789 000 123'
                            ],
                            style: 'infoText',
                        },
                        {
                            text: [
                                `Date: ${new Date().toLocaleDateString('fr-FR')}\n`,
                                `Référence: ${quotation.number}\n`,
                                `Validité: 15 jours`
                            ],
                            style: 'infoText',
                            alignment: 'right',
                        },
                    ],
                    columnGap: 20,
                    margin: [0, 0, 0, 20]
                },
            ],
            styles: {
                header: {
                    fontSize: 24,
                    bold: true,
                    alignment: 'center',
                    color: '#1a3d72',
                    margin: [0, 0, 0, 10],
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    color: '#1a3d72',
                    margin: [0, 0, 0, 20],
                },
                infoHeader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 0, 0, 5],
                    color: '#444',
                },
                infoText: {
                    fontSize: 12,
                    color: '#555',
                    lineHeight: 1.5,
                },
                durationHeader: {
                    fontSize: 16,
                    bold: true,
                    color: '#1a3d72',
                    margin: [0, 0, 0, 10]
                },
                summaryHeader: {
                    fontSize: 16,
                    bold: true,
                    color: '#1a3d72',
                    margin: [0, 0, 0, 10]
                },
                tableHeaderCell: {
                    fillColor: '#f1f1f1',
                    color: '#1a3d72',
                    alignment: 'center',
                    fontSize: 12,
                    bold: true,
                    margin: [5, 5],
                },
                tableText: {
                    fontSize: 12,
                    alignment: 'center',
                    margin: [5, 5],
                },
                totalLabel: {
                    fontSize: 12,
                    alignment: 'right',
                    margin: [5, 5],
                    bold: true
                },
                totalValue: {
                    fontSize: 12,
                    alignment: 'center',
                    margin: [5, 5],
                    bold: true
                },
                summaryLabel: {
                    fontSize: 12,
                    margin: [0, 5, 0, 5]
                },
                summaryValue: {
                    fontSize: 12,
                    alignment: 'right',
                    margin: [0, 5, 0, 5]
                },
                conditionsHeader: {
                    fontSize: 14,
                    bold: true,
                    color: '#1a3d72'
                },
                conditionsText: {
                    fontSize: 11,
                    color: '#555',
                    lineHeight: 1.5
                },
                signatureLabel: {
                    fontSize: 12,
                    alignment: 'right',
                    margin: [0, 0, 100, 0]
                },
                signatureText: {
                    fontSize: 11,
                    alignment: 'right',
                    margin: [0, 0, 100, 0],
                    color: '#777'
                },
                footerText: {
                    fontSize: 10,
                    color: '#666',
                    alignment: 'center',
                    lineHeight: 1.5
                }
            },
            defaultStyle: {
                font: 'Roboto'
            },
            pageMargins: [40, 60, 40, 90],
            footer: function (currentPage, pageCount) {
                return {
                    text: [
                        {text: 'EJAAR - ', bold: true},
                        '1234 rue fictive, Ville - Tél: 01 23 45 67 89 - contact@ejaar.com\n',
                        'ICE: 123 456 789 000 123 - IBAN: FR76 1234 5678 9123 4567 8912 345'
                    ],
                    style: 'footerText',
                    margin: [40, 10]
                };
            }
        };

        if (details24Months.deviceRows.length) {
            docDefinition.content?.push(
                // 24 months equipment table
                    {
                        text: 'Matériel en location sur 24 mois',
                        style: 'durationHeader',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    {text: 'Type de matériel', style: 'tableHeaderCell'},
                                    {text: 'Référence', style: 'tableHeaderCell'},
                                    {text: 'Designation', style: 'tableHeaderCell'},
                                    {text: 'Quantité', style: 'tableHeaderCell'},
                                    {text: 'Prix Unitaire HT', style: 'tableHeaderCell'},
                                    {text: 'Loyer HT', style: 'tableHeaderCell'},
                                ],
                                ...details24Months.deviceRows,
                                [
                                    {text: 'Loyers Totaux (HT)', colSpan: 5, style: 'totalLabel'},
                                    {}, {}, {}, {},
                                    {text: details24Months.totalMonthlyPayment.toFixed(0) + ' DH', style: 'totalValue'}
                                ],
                                [
                                    {text: 'Loyer sur 24 mois (HT)', colSpan: 5, style: 'totalLabel'},
                                    {}, {}, {}, {},
                                    {text: details24Months.totalLeasingCost.toFixed(0) + ' DH', style: 'totalValue'}
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                            vLineWidth: () => 0.5,
                            hLineColor: () => '#aaaaaa',
                            vLineColor: () => '#aaaaaa',
                        },
                        margin: [0, 0, 0, 20]
                    },

                {text: ''},
            );
        }
        if (details36Months.deviceRows.length) {
            docDefinition.content.push(
                {
                    text: 'Matériel en location sur 36 mois',
                    style: 'durationHeader',
                    margin: [0, 20, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {text: 'Type de matériel', style: 'tableHeaderCell'},
                                {text: 'Référence', style: 'tableHeaderCell'},
                                {text: 'Designation', style: 'tableHeaderCell'},
                                {text: 'Quantité', style: 'tableHeaderCell'},
                                {text: 'Prix Unitaire HT', style: 'tableHeaderCell'},
                                {text: 'Loyer HT', style: 'tableHeaderCell'},
                            ],
                            ...details36Months.deviceRows,
                            [
                                {text: 'Loyers Totaux (HT)', colSpan: 5, style: 'totalLabel'},
                                {}, {}, {}, {},
                                {text: details36Months.totalMonthlyPayment.toFixed(0) + ' DH', style: 'totalValue'}
                            ],
                            [
                                {text: 'Loyer sur 36 mois (HT)', colSpan: 5, style: 'totalLabel'},
                                {}, {}, {}, {},
                                {text: details36Months.totalLeasingCost.toFixed(0) + ' DH', style: 'totalValue'}
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#aaaaaa',
                        vLineColor: () => '#aaaaaa',
                    },
                    margin: [0, 0, 0, 20]
                },
            )

        }
        docDefinition.content.push(
            {text: '', pageBreak: 'before'},
            // Operation summary
            {
                text: 'Récapitulatif de l\'opération',
                style: 'summaryHeader',
                margin: [0, 20, 0, 10]
            },
            {
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            {text: 'Total matériel financé', style: 'summaryLabel'},
                            {text: totalFinancedAmount.toFixed(0) + ' DH', style: 'summaryValue'}
                        ],
                        [
                            {text: 'Loyers mensuels', style: 'summaryLabel'},
                            {text: totalMonthlyPayments.toFixed(0) + ' DH', style: 'summaryValue'}
                        ],
                        [
                            {text: 'Total loyers dûs sur la période du contrat', style: 'summaryLabel'},
                            {text: totalLeasingCost.toFixed(0) + ' DH', style: 'summaryValue'}
                        ],
                        [
                            {
                                text: 'Option d\'achat activable a postériori\n' +
                                    '(Valeur résiduelle + 2% du matériel)',
                                style: 'summaryLabel'
                            },
                            {text: totalPurchaseOption.toFixed(0) + ' DH', style: 'summaryValue'}
                        ],
                        [
                            {
                                text: 'Total opération y compris l\'option d\'achat',
                                style: 'summaryLabel',
                                bold: true
                            },
                            {text: totalOperationCost.toFixed(0) + ' DH', style: 'summaryValue', bold: true}
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#aaaaaa',
                    vLineColor: () => '#aaaaaa',
                },
                margin: [0, 0, 0, 40]
            },

            // Conditions and signature
            {
                text: 'Conditions générales :',
                style: 'conditionsHeader',
                margin: [0, 0, 0, 5]
            },
            {
                ul: [
                    'Paiement mensuel par prélèvement automatique',
                    'Assurance incluse dans la mensualité',
                    'Option d\'achat en fin de contrat',
                    'Délai de validité : 15 jours',
                    'Engagement pour la durée totale du contrat'
                ],
                style: 'conditionsText',
                margin: [0, 0, 0, 20]
            },
            {
                text: 'Bon pour accord',
                style: 'signatureLabel',
                margin: [0, 40, 0, 5]
            },
            {
                text: 'Le Client',
                style: 'signatureText',
                margin: [0, 0, 0, 0]
            }
        )


        // Create the PDF document
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        const chunks: Uint8Array<any>[] = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));

        // Create a promise to handle the PDF generation
        const pdfGenerated = new Promise((resolve, reject) => {
            pdfDoc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            pdfDoc.on('error', reject);
        });

        // Finalize the PDF document
        pdfDoc.end();
        const fileName = `devis-location-ejaar-${Math.random() * 123}.pdf`;
        const serverFilePath = join('/var', 'opt', 'ejaar', 'devis', fileName);
        quotation.fileName = fileName;
        try {
            const pdfBuffer = await pdfGenerated;

            // Ensure the directory exists
            const devisDir = join('/var', 'opt', 'ejaar', 'devis');
            if (!existsSync(devisDir)) {
                mkdirSync(devisDir, {recursive: true});
            }

            // Save the PDF to the server
            writeFileSync(serverFilePath, pdfBuffer as string);

            // Send the PDF as a response to the client
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(pdfBuffer);
            await this.quotationsService.save(quotation);

        } catch (error) {
            console.error('Error generating or saving PDF:', error);
            res.status(500).send('Erreur lors de la génération du devis');
        }
    }


    @Post('simulate')
    async simulateQuotation(@Body() formData: CreateQuotationDto, @Res() res: Response) {
        const fonts = {
            Roboto: {
                normal: join('src', 'assets', 'fonts', 'Roboto-Regular.ttf'),
                bold: join('src', 'assets', 'fonts', 'Roboto-Bold.ttf'),
                italics: join('src', 'assets', 'fonts', 'Roboto-Italic.ttf'),
            },
        };
        const printer = new PdfPrinter(fonts);


        // Load necessary configurations
        const [tauxResponse, residualResponse] = await Promise.all([
            this.rateConfigService.findAll(),
            this.residualConfigService.findAll()
        ]);

        const tauxLoyerConfig = await this.rateConfigService.findAll();
        const residualConfig = await this.residualConfigService.findAll();

        const tauxMap = tauxLoyerConfig.reduce((acc, curr) => {
            acc[curr.categorieCA] = {
                tauxBanque: curr.tauxBanque,
                spread: curr.spread,
            };
            return acc;
        }, {});

        const residualMap = residualConfig.reduce((acc, curr) => {
            acc[curr.device] = {
                months24: curr.months24,
                months36: curr.months36,
            };
            return acc;
        }, {});

        console.log(residualMap, tauxMap);

        // Group devices by duration
        const devices24Months = formData.devices.filter(device => device.duration === '24');
        const devices36Months = formData.devices.filter(device => device.duration === '36');

        console.log(formData);
        console.log(devices24Months);
        console.log(devices36Months);
        // Calculate leasing details for each group
        const calculateGroupDetails = (devices: any[], duration: number) => {
            let totalAmount = 0;
            let totalMonthlyPayment = 0;
            let totalResidualValue = 0;

            const deviceRows = devices.map(device => {
                const amount = device.unitCost * device.units;
                totalAmount += amount;

                const residualValuePercentage = residualMap[device.type][`months${duration}`];
                let spread = 0;
                let leasingRate = 0;
                spread = tauxMap[formData.clientCA].spread;
                leasingRate = tauxMap[formData.clientCA].tauxBanque;

                const calculations = performCalculations(
                    amount,
                    duration,
                    parseFloat(residualValuePercentage),
                    +spread,
                    +leasingRate
                );
                totalMonthlyPayment += calculations.monthlyPayment;
                totalResidualValue += calculateResidualValue(amount, residualValuePercentage);

                return [
                    {text: device.type, style: 'tableText'},
                    {text: device.reference || '-', style: 'tableText'},
                    {text: device.designation || '-', style: 'tableText'},
                    {text: device.units.toString(), style: 'tableText'},
                    {text: device.unitCost.toFixed(0) + ' DH', style: 'tableText'},
                    {text: calculations.monthlyPayment.toFixed(0) + ' DH', style: 'tableText'},
                ];
            });

            return {
                deviceRows,
                totalAmount,
                totalMonthlyPayment,
                totalResidualValue,
                totalLeasingCost: totalMonthlyPayment * duration
            };
        };

        const details24Months = calculateGroupDetails(devices24Months, 24);
        const details36Months = calculateGroupDetails(devices36Months, 36);

        // Calculate purchase option (residual value + 2%)
        const calculatePurchaseOption = (devices: any[], duration: number) => {
            return devices.reduce((sum, device) => {
                const residualPercentage = +residualMap[device.type][`months${duration}`] + 2;
                return sum + (device.unitCost * device.units * residualPercentage) / 100;
            }, 0);
        };

        const purchaseOption24 = devices24Months.length > 0 ? calculatePurchaseOption(devices24Months, 24) : 0;
        const purchaseOption36 = devices36Months.length > 0 ? calculatePurchaseOption(devices36Months, 36) : 0;
        const totalPurchaseOption = purchaseOption24 + purchaseOption36;

        // Calculate totals
        const totalFinancedAmount = (details24Months?.totalAmount || 0) + (details36Months?.totalAmount || 0);
        const totalMonthlyPayments = (details24Months?.totalMonthlyPayment || 0) + (details36Months?.totalMonthlyPayment || 0);
        const totalLeasingCost = (details24Months?.totalLeasingCost || 0) + (details36Months?.totalLeasingCost || 0);
        const totalOperationCost = totalLeasingCost + totalPurchaseOption;

        const docDefinition: any = {
            content: [
                // Header section
                {
                    image: join('src', 'assets', 'images', 'ejaar_logo_v2.png'),
                    width: 100,
                    alignment: 'left',
                    margin: [0, 0, 0, 5]
                },
                {
                    text: 'DEVIS DE LOCATION',
                    style: 'header',
                },
                {
                    text: 'EJAAR - Détails du devis de location',
                    style: 'subheader',
                },
                {
                    text: 'Informations sur votre entreprise',
                    style: 'infoHeader',
                },
                {
                    columns: [
                        {
                            text: [
                                'EJAAR\n',
                                '1234 rue fictive, Ville\n',
                                'Téléphone: 01 23 45 67 89\n',
                                'Email: contact@ejaar.com\n',
                                'ICE: 123 456 789 000 123'
                            ],
                            style: 'infoText',
                        },
                        {
                            text: [
                                `Date: ${new Date().toLocaleDateString('fr-FR')}\n`,
                                `Référence: SIMULATION\n`,
                                `Validité: 15 jours`
                            ],
                            style: 'infoText',
                            alignment: 'right',
                        },
                    ],
                    columnGap: 20,
                    margin: [0, 0, 0, 20]
                },
            ],
            styles: {
                header: {
                    fontSize: 24,
                    bold: true,
                    alignment: 'center',
                    color: '#1a3d72',
                    margin: [0, 0, 0, 10],
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    color: '#1a3d72',
                    margin: [0, 0, 0, 20],
                },
                infoHeader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 0, 0, 5],
                    color: '#444',
                },
                infoText: {
                    fontSize: 12,
                    color: '#555',
                    lineHeight: 1.5,
                },
                durationHeader: {
                    fontSize: 16,
                    bold: true,
                    color: '#1a3d72',
                    margin: [0, 0, 0, 10]
                },
                summaryHeader: {
                    fontSize: 16,
                    bold: true,
                    color: '#1a3d72',
                    margin: [0, 0, 0, 10]
                },
                tableHeaderCell: {
                    fillColor: '#f1f1f1',
                    color: '#1a3d72',
                    alignment: 'center',
                    fontSize: 12,
                    bold: true,
                    margin: [5, 5],
                },
                tableText: {
                    fontSize: 12,
                    alignment: 'center',
                    margin: [5, 5],
                },
                totalLabel: {
                    fontSize: 12,
                    alignment: 'right',
                    margin: [5, 5],
                    bold: true
                },
                totalValue: {
                    fontSize: 12,
                    alignment: 'center',
                    margin: [5, 5],
                    bold: true
                },
                summaryLabel: {
                    fontSize: 12,
                    margin: [0, 5, 0, 5]
                },
                summaryValue: {
                    fontSize: 12,
                    alignment: 'right',
                    margin: [0, 5, 0, 5]
                },
                conditionsHeader: {
                    fontSize: 14,
                    bold: true,
                    color: '#1a3d72'
                },
                conditionsText: {
                    fontSize: 11,
                    color: '#555',
                    lineHeight: 1.5
                },
                signatureLabel: {
                    fontSize: 12,
                    alignment: 'right',
                    margin: [0, 0, 100, 0]
                },
                signatureText: {
                    fontSize: 11,
                    alignment: 'right',
                    margin: [0, 0, 100, 0],
                    color: '#777'
                },
                footerText: {
                    fontSize: 10,
                    color: '#666',
                    alignment: 'center',
                    lineHeight: 1.5
                }
            },
            defaultStyle: {
                font: 'Roboto'
            },
            pageMargins: [40, 60, 40, 90],
            footer: function (currentPage, pageCount) {
                return {
                    text: [
                        {text: 'EJAAR - ', bold: true},
                        '1234 rue fictive, Ville - Tél: 01 23 45 67 89 - contact@ejaar.com\n',
                        'ICE: 123 456 789 000 123 - IBAN: FR76 1234 5678 9123 4567 8912 345'
                    ],
                    style: 'footerText',
                    margin: [40, 10]
                };
            }
        };

        if (details24Months.deviceRows.length) {
            docDefinition.content?.push(
                // 24 months equipment table
                {
                    text: 'Matériel en location sur 24 mois',
                    style: 'durationHeader',
                    margin: [0, 0, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {text: 'Type de matériel', style: 'tableHeaderCell'},
                                {text: 'Référence', style: 'tableHeaderCell'},
                                {text: 'Designation', style: 'tableHeaderCell'},
                                {text: 'Quantité', style: 'tableHeaderCell'},
                                {text: 'Prix Unitaire HT', style: 'tableHeaderCell'},
                                {text: 'Loyer HT', style: 'tableHeaderCell'},
                            ],
                            ...details24Months.deviceRows,
                            [
                                {text: 'Loyers Totaux (HT)', colSpan: 5, style: 'totalLabel'},
                                {}, {}, {}, {},
                                {text: details24Months.totalMonthlyPayment.toFixed(0) + ' DH', style: 'totalValue'}
                            ],
                            [
                                {text: 'Loyer sur 24 mois (HT)', colSpan: 5, style: 'totalLabel'},
                                {}, {}, {}, {},
                                {text: details24Months.totalLeasingCost.toFixed(0) + ' DH', style: 'totalValue'}
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#aaaaaa',
                        vLineColor: () => '#aaaaaa',
                    },
                    margin: [0, 0, 0, 20]
                },

                {text: ''},
            );
        }
        if (details36Months.deviceRows.length) {
            docDefinition.content.push(
                {
                    text: 'Matériel en location sur 36 mois',
                    style: 'durationHeader',
                    margin: [0, 20, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {text: 'Type de matériel', style: 'tableHeaderCell'},
                                {text: 'Référence', style: 'tableHeaderCell'},
                                {text: 'Designation', style: 'tableHeaderCell'},
                                {text: 'Quantité', style: 'tableHeaderCell'},
                                {text: 'Prix Unitaire HT', style: 'tableHeaderCell'},
                                {text: 'Loyer HT', style: 'tableHeaderCell'},
                            ],
                            ...details36Months.deviceRows,
                            [
                                {text: 'Loyers Totaux (HT)', colSpan: 5, style: 'totalLabel'},
                                {}, {}, {}, {},
                                {text: details36Months.totalMonthlyPayment.toFixed(0) + ' DH', style: 'totalValue'}
                            ],
                            [
                                {text: 'Loyer sur 36 mois (HT)', colSpan: 5, style: 'totalLabel'},
                                {}, {}, {}, {},
                                {text: details36Months.totalLeasingCost.toFixed(0) + ' DH', style: 'totalValue'}
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#aaaaaa',
                        vLineColor: () => '#aaaaaa',
                    },
                    margin: [0, 0, 0, 20]
                },
            )

        }
        docDefinition.content.push(
            {text: '', pageBreak: 'before'},
            // Operation summary
            {
                text: 'Récapitulatif de l\'opération',
                style: 'summaryHeader',
                margin: [0, 20, 0, 10]
            },
            {
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            {text: 'Total matériel financé', style: 'summaryLabel'},
                            {text: totalFinancedAmount.toFixed(0) + ' DH', style: 'summaryValue'}
                        ],
                        [
                            {text: 'Loyers mensuels', style: 'summaryLabel'},
                            {text: totalMonthlyPayments.toFixed(0) + ' DH', style: 'summaryValue'}
                        ],
                        [
                            {text: 'Total loyers dûs sur la période du contrat', style: 'summaryLabel'},
                            {text: totalLeasingCost.toFixed(0) + ' DH', style: 'summaryValue'}
                        ],
                        [
                            {
                                text: 'Option d\'achat activable a postériori\n' +
                                    '(Valeur résiduelle + 2% du matériel)',
                                style: 'summaryLabel'
                            },
                            {text: totalPurchaseOption.toFixed(0) + ' DH', style: 'summaryValue'}
                        ],
                        [
                            {
                                text: 'Total opération y compris l\'option d\'achat',
                                style: 'summaryLabel',
                                bold: true
                            },
                            {text: totalOperationCost.toFixed(0) + ' DH', style: 'summaryValue', bold: true}
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#aaaaaa',
                    vLineColor: () => '#aaaaaa',
                },
                margin: [0, 0, 0, 40]
            },

            // Conditions and signature
            {
                text: 'Conditions générales :',
                style: 'conditionsHeader',
                margin: [0, 0, 0, 5]
            },
            {
                ul: [
                    'Paiement mensuel par prélèvement automatique',
                    'Assurance incluse dans la mensualité',
                    'Option d\'achat en fin de contrat',
                    'Délai de validité : 15 jours',
                    'Engagement pour la durée totale du contrat'
                ],
                style: 'conditionsText',
                margin: [0, 0, 0, 20]
            },
            {
                text: 'Bon pour accord',
                style: 'signatureLabel',
                margin: [0, 40, 0, 5]
            },
            {
                text: 'Le Client',
                style: 'signatureText',
                margin: [0, 0, 0, 0]
            }
        )

        // Create the PDF document
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        const chunks: Uint8Array<any>[] = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));

        // Create a promise to handle the PDF generation
        const pdfGenerated = new Promise((resolve, reject) => {
            pdfDoc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });
            pdfDoc.on('error', reject);
        });

        // Finalize the PDF document
        pdfDoc.end();
        try {
            const pdfBuffer = await pdfGenerated;

            // Ensure the directory exists
            // Send the PDF as a response to the client
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="simulation-devis.pdf"`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating or saving PDF:', error);
            res.status(500).send('Erreur lors de la génération du devis');
        }
    }

    @Get(':id/download')
    async downloadQuotation(@Param('id') id: number, @Res() res: Response) {
        // 1. Get the quotation from database
        const quotation = await this.quotationsService.findOne(id);

        if (!quotation || !quotation.fileName) {
            throw new NotFoundException('Quotation or file not found');
        }

        // 2. Construct the file path
        const filePath = join('/var/opt/ejaar/devis', quotation.fileName);

        // 3. Check if file exists
        if (!existsSync(filePath)) {
            throw new NotFoundException('PDF file not found on server');
        }

        // 4. Send the file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${quotation.fileName}"`
        );
        res.sendFile(filePath);
    }


    @Patch(':id/validate')
    async validateQuotation(
        @Param('id') id: number,
        @Res() res: Response
    ) {
        try {
            // Update status in your service
            const updatedQuotation = await this.quotationsService.updateStatus(id, QuotationStatusEnum.VALIDE_CLIENT);

            return res.status(HttpStatus.OK).json({
                message: 'Quotation validated successfully',
                data: updatedQuotation,
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Error validating quotation',
                error: error.message,
            });
        }
    }
}
