package com.inventorymanagement.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inventorymanagement.backend.Entity.Invoice;
import com.inventorymanagement.backend.Entity.InvoiceDocument;
import com.inventorymanagement.backend.Entity.InvoiceItems;
import com.inventorymanagement.backend.request.CreateInvoiceRequest;
import com.inventorymanagement.backend.request.InvoiceItemRequest;
import com.inventorymanagement.backend.repository.InvoiceRepository;

@Service
public class InvoiceService {

    @Autowired
    private final PdfService pdfService;
    @Autowired
    private final InvoiceRepository invoiceRepository;

    public InvoiceService(
            PdfService pdfService,
            InvoiceRepository invoiceRepository) {

        this.pdfService = pdfService;
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Called by POST /api/invoice/invoicecreate with the JSON body sent
     * from the React frontend. Builds a real Invoice from that data,
     * generates the PDF, and saves it. Returns the saved InvoiceDocument's id
     * — the frontend uses this id to download the PDF afterwards.
     */
    public Long createInvoice(CreateInvoiceRequest request) {

        Invoice invoice = buildInvoiceFromRequest(request);

        byte[] pdfBytes;
        try {
            pdfBytes = pdfService.generateInvoicePdf(invoice);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }

        InvoiceDocument doc = new InvoiceDocument();
        doc.setInvoiceNo(invoice.getInvoiceNo());
        doc.setFileName("invoice.pdf");
        doc.setContentType("application/pdf");
        doc.setPdfData(pdfBytes);

        InvoiceDocument saved = invoiceRepository.save(doc);

        return saved.getId();
    }

    /**
     * Called by GET /api/invoice/pdf/{id} to fetch a previously generated
     * PDF straight from the database, without regenerating it.
     */
    public InvoiceDocument getInvoicePdf(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

    private Invoice buildInvoiceFromRequest(CreateInvoiceRequest request) {
        Invoice invoice = new Invoice();

        // Simple auto-generated invoice number; swap for your own numbering
        // scheme (e.g. a DB sequence or a formatted date + counter) later.
        invoice.setInvoiceNo("INV-" + System.currentTimeMillis());

        invoice.setCustomerName(request.getCustomerName());
        invoice.setBillingAddress(request.getBillingAddress());
        invoice.setStatus(request.getStatus());
        invoice.setInvoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now());
        invoice.setDueDate(request.getDueDate());
        invoice.setPaymentTerms(request.getPaymentTerms());
        invoice.setSubtotal(nvl(request.getSubtotal()));
        invoice.setCgst(nvl(request.getCgst()));
        invoice.setSgst(nvl(request.getSgst()));
        invoice.setTransport(nvl(request.getTransport()));
        invoice.setDiscount(nvl(request.getDiscount()));
        invoice.setAmount(nvl(request.getAmount()));
        invoice.setNotes(request.getNotes());

        if (request.getItems() != null) {
            for (InvoiceItemRequest itemReq : request.getItems()) {
                InvoiceItems item = new InvoiceItems();
                item.setName(itemReq.getName());
                item.setQty(itemReq.getQty());
                item.setUnit(itemReq.getUnit());
                item.setUnitPrice(nvl(itemReq.getUnitPrice()));
                item.setAmount(nvl(itemReq.getAmount()));
                invoice.addItem(item);
            }
        }

        return invoice;
    }

    private BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}