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

@Controller('quotations')
export class QuotationsController {
    constructor(private readonly quotationsService: QuotationsService,
                private readonly usersService: UsersService,
                private readonly supplierService: SuppliersService,
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

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.quotationsService.findOne(+id);
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
        quotation.status = QuotationStatusEnum.GENERE;
        quotation.duration = formData.duration;


        // Define PDF fonts
        const fonts = {
            Roboto: {
                normal: join('src', 'assets', 'fonts', 'Roboto-Regular.ttf'),
                bold: join('src', 'assets', 'fonts', 'Roboto-Bold.ttf'),
                italics: join('src', 'assets', 'fonts', 'Roboto-Italic.ttf'),
            },
        };

        const printer = new PdfPrinter(fonts);

        // Generate devices table rows
        const deviceRows = formData.devices.map(device => [
            {text: device.type, style: 'tableText'},
            {text: device.unitCost.toFixed(2) + ' DH', style: 'tableText'},
            {text: device.units.toString(), style: 'tableText'},
            {text: (device.unitCost * device.units).toFixed(2) + ' DH', style: 'tableText'},
        ]);

        // Calculate total amount
        const totalAmount = formData.devices.reduce((sum, device) => sum + device.unitCost * device.units, 0);
        const tvaAmount = totalAmount * 0.2;
        const totalTTC = totalAmount + tvaAmount;
        quotation.amount = totalAmount;
        // Calculate leasing details
        const leasingDuration = +formData.duration || 36; // default to 36 months if not provided
        const monthlyPayment = totalTTC / leasingDuration;
        const totalLeasingCost = totalTTC; // Could add interest here if needed

        // Define the content of the PDF document
        const docDefinition: TDocumentDefinitions = {
            content: [
                {
                    image: join('src', 'assets', 'images', 'ejaar_logo_v2.png'),
                    width: 100,
                    alignment: 'right',
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
                                `Référence: DEV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\n`,
                                `Validité: 15 jours`
                            ],
                            style: 'infoText',
                            alignment: 'right',
                        },
                    ],
                    columnGap: 20,
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'Détails des équipements à louer',
                    style: 'tableHeader',
                    margin: [0, 0, 0, 10],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Description', style: 'tableHeaderCell' },
                                { text: 'Prix unitaire', style: 'tableHeaderCell' },
                                { text: 'Quantité', style: 'tableHeaderCell' },
                                { text: 'Total', style: 'tableHeaderCell' },
                            ],
                            ...deviceRows,
                            [
                                { text: 'TOTAL HT', colSpan: 3, style: 'totalLabel' },
                                {},
                                {},
                                { text: totalAmount.toFixed(2) + ' DH', style: 'totalValue' }
                            ],
                            [
                                { text: `TVA (20%)`, colSpan: 3, style: 'totalLabel' },
                                {},
                                {},
                                { text: tvaAmount.toFixed(2) + ' DH', style: 'totalValue' }
                            ],
                            [
                                { text: 'TOTAL TTC', colSpan: 3, style: 'totalLabel', bold: true },
                                {},
                                {},
                                { text: totalTTC.toFixed(2) + ' DH', style: 'totalValue', bold: true }
                            ]
                        ],
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            return 1;
                        },
                        vLineWidth: function(i, node) {
                            return 1;
                        },
                        hLineColor: function(i, node) {
                            return '#aaaaaa';
                        },
                        vLineColor: function(i, node) {
                            return '#aaaaaa';
                        },
                    },
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'Détails de la location',
                    style: 'tableHeader',
                    margin: [0, 0, 0, 10],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto'],
                        body: [
                            [
                                { text: 'Durée de location', style: 'tableHeaderCell' },
                                { text: `${leasingDuration} mois`, style: 'tableText' }
                            ],
                            [
                                { text: 'Mensualité (TTC)', style: 'tableHeaderCell' },
                                { text: monthlyPayment.toFixed(2) + ' DH', style: 'tableText' }
                            ],
                            [
                                { text: 'Coût total location (TTC)', style: 'tableHeaderCell' },
                                { text: totalLeasingCost.toFixed(2) + ' DH', style: 'tableText' }
                            ],
                        ],
                    },
                    layout: {
                        hLineWidth: function(i, node) {
                            return 1;
                        },
                        vLineWidth: function(i, node) {
                            return 1;
                        },
                        hLineColor: function(i, node) {
                            return '#aaaaaa';
                        },
                        vLineColor: function(i, node) {
                            return '#aaaaaa';
                        },
                    },
                    margin: [0, 0, 0, 20]
                },
                /*{
                    text: [
                        'Conditions de location :\n',
                        '- Une fois le devis accepté, vous serez amené à uploader vos justificatifs\n',
                        '- Délai de validité : 15 jours\n',
                        '- Paiement mensuel par prélèvement automatique\n',
                        '- Assurance incluse dans la mensualité\n',
                        '- Option d\'achat en fin de contrat disponible'
                    ],
                    style: 'conditionsText',
                    margin: [0, 0, 0, 20]
                },*/
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
            ],
            footer: function(currentPage, pageCount) {
                return {
                    text: [
                        { text: 'EJAAR - ', bold: true },
                        '1234 rue fictive, Ville - Tél: 01 23 45 67 89 - contact@ejaar.com\n',
                        'ICE: 123 456 789 000 123\n',
                        'IBAN: FR76 1234 5678 9123 4567 8912 345'
                    ],
                    style: 'footerText',
                    margin: [40, 10]
                };
            },
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
                tableHeader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 0, 0, 5],
                    color: '#1a3d72',
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
                },
                totalValue: {
                    fontSize: 12,
                    alignment: 'center',
                    margin: [5, 5],
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
        };

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
        const fileName = `devis-location-ejaar-${Math.random()*123}.pdf`;
        const serverFilePath = join('/var', 'opt', 'ejaar', 'devis', fileName);
        quotation.fileName = fileName;
        try {
            const pdfBuffer = await pdfGenerated;

            // Ensure the directory exists
            const devisDir = join('/var', 'opt', 'ejaar', 'devis');
            if (!existsSync(devisDir)) {
                mkdirSync(devisDir, { recursive: true });
            }

            // Save the PDF to the server
            writeFileSync(serverFilePath, pdfBuffer as string);

            // Send the PDF as a response to the client
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(pdfBuffer);
            await  this.quotationsService.save(quotation);

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
