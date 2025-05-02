import {Controller, Get, Post, Body, Patch, Param, Delete, Res} from '@nestjs/common';
import {QuotationsService} from './quotations.service';
import {CreateQuotationDto} from './dto/create-quotation.dto';
import {UpdateQuotationDto} from './dto/update-quotation.dto';
import {Response} from 'express';
import PdfPrinter from 'pdfmake';
import {Alignment, TDocumentDefinitions} from "pdfmake/interfaces";
import {join} from "path"; // Make sure this import is here

@Controller('quotations')
export class QuotationsController {
    constructor(private readonly quotationsService: QuotationsService) {
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

        // Define the content of the PDF document
        const docDefinition: TDocumentDefinitions = {
            content: [
                {
                    image: join('src', 'assets', 'images', 'ejaar_logo_v2.png'),
                    width: 100,
                    alignment: 'right',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'DEVIS',
                    style: 'header',
                },
                {
                    text: 'EJAAR - Détails du devis',
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
                                'SIRET: 123 456 789 00012'
                            ],
                            style: 'infoText',
                        },
                        {
                            text: [
                                `Date: ${new Date().toLocaleDateString('fr-FR')}\n`,
                                `Référence: DEV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\n`,
                                `Validité: 30 jours`
                            ],
                            style: 'infoText',
                            alignment: 'right',
                        },
                    ],
                    columnGap: 20,
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'Détails des articles',
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
                                { text: (totalAmount * 0.2).toFixed(2) + ' DH', style: 'totalValue' }
                            ],
                            [
                                { text: 'TOTAL TTC', colSpan: 3, style: 'totalLabel', bold: true },
                                {},
                                {},
                                { text: (totalAmount * 1.2).toFixed(2) + ' DH', style: 'totalValue', bold: true }
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
                    margin: [0, 0, 0, 40]
                },
                {
                    text: 'Conditions : Une fois le devis accepté, vous serez amené à uploader vos justificatifs\nDélai  : 15 jours',
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
            ],
            footer: function(currentPage, pageCount) {
                return {
                    text: [
                        { text: 'EJAAR - ', bold: true },
                        '1234 rue fictive, Ville - Tél: 01 23 45 67 89 - contact@ejaar.com\n',
                        'SIRET: 123 456 789 00012 - APE: 6201Z - TVA Intracommunautaire: FR00123456789\n',
                        'IBAN: FR76 1234 5678 9123 4567 8912 345 - BIC: ABCDEFGH123'
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
                    italics: true
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

        // Send the PDF as a response to the client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="devis-ejaar.pdf"');
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
}
