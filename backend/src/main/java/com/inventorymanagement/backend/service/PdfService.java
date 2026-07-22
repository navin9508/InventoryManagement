package com.inventorymanagement.backend.service;

import com.inventorymanagement.backend.Entity.Invoice;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PdfService {

    private final TemplateEngine templateEngine;
    private final Qrcodeservice qrCodeService;

    // your real UPI VPA — move to application.properties if you prefer
    @Value("${invoice.upi.vpa}")
    private String upiVpa;

    public PdfService(TemplateEngine templateEngine, Qrcodeservice qrCodeService) {
        this.templateEngine = templateEngine;
        this.qrCodeService = qrCodeService;
    }

    public byte[] generateInvoicePdf(Invoice invoiceEntity) throws Exception {

        // 1. Build the invoice map exactly as you already do
        Map<String, Object> invoiceMap = new HashMap<>();
        invoiceMap.put("status", invoiceEntity.getStatus());
        invoiceMap.put("billingAddress", invoiceEntity.getBillingAddress());
        invoiceMap.put("invoiceDate", invoiceEntity.getInvoiceDate());
        invoiceMap.put("subtotal", formatCurrency(invoiceEntity.getSubtotal()));
        invoiceMap.put("cgst", formatCurrency(invoiceEntity.getCgst()));
        invoiceMap.put("sgst", formatCurrency(invoiceEntity.getSgst()));
        invoiceMap.put("transport", formatCurrency(invoiceEntity.getTransport()));
        invoiceMap.put("discount", formatCurrency(invoiceEntity.getDiscount()));
        invoiceMap.put("amount", formatCurrency(invoiceEntity.getAmount())); // "₹62,482" — display only
        invoiceMap.put("items", buildItemsList(invoiceEntity));

        // 2. Generate the QR — use the RAW BigDecimal total, not the formatted "amount" string above
        BigDecimal rawTotal = invoiceEntity.getAmount(); // adjust getter name to your entity
        try {
            String qrBase64 = qrCodeService.generateUpiQrBase64(
                    upiVpa,
                    "Rakshion Agro Solution",
                    rawTotal,
                    invoiceEntity.getInvoiceNo()
            );
            invoiceMap.put("upiQrBase64", qrBase64);
        } catch (Exception e) {
            // don't let a QR failure block the whole invoice — template's th:if hides the cell if absent
            invoiceMap.put("upiQrBase64", null);
        }

        // 3. Push into Thymeleaf context — same as before
        Context context = new Context();
        context.setVariable("invoice", invoiceMap);
        context.setVariable("invoiceNo", invoiceEntity.getInvoiceNo());
        context.setVariable("customerName", invoiceEntity.getCustomerName());

        String html = templateEngine.process("invoice", context);

        // 4. Render to PDF — same as before
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.useFastMode();
        builder.withHtmlContent(html, null);
        builder.toStream(outputStream);
        builder.run();

        return outputStream.toByteArray();
    }

    private String formatCurrency(BigDecimal value) {
        return "₹" + String.format("%,.0f", value);
    }

    private List<Map<String, Object>> buildItemsList(Invoice invoiceEntity) {
        // your existing per-line-item mapping logic
        return invoiceEntity.getItems().stream().map(item -> {
            Map<String, Object> m = new HashMap<>();
            m.put("name", item.getName());
            m.put("qty", item.getQty());
            m.put("unit", item.getUnit());
            m.put("unitPrice", formatCurrency(item.getUnitPrice()));
            m.put("amount", formatCurrency(item.getAmount()));
            return m;
        }).toList();
    }
}