package com.inventorymanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.inventorymanagement.backend.Entity.InvoiceDocument;
import com.inventorymanagement.backend.request.CreateInvoiceRequest;
import com.inventorymanagement.backend.service.InvoiceService;

@RestController
@RequestMapping("/api/invoice")
@CrossOrigin(origins = "http://localhost:3000") // adjust to your React dev server's actual origin
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    /**
     * React calls this with the invoice form data as JSON.
     * Returns the new invoice's id.
     */
    @PostMapping("/invoicecreate")
    public ResponseEntity<Long> createInvoice(@RequestBody CreateInvoiceRequest request) {
        try {
            Long id = invoiceService.createInvoice(request);
            return ResponseEntity.ok(id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * React calls this (e.g. window.open or an <a> download link) with the
     * id returned from /invoicecreate, to fetch the already-generated PDF.
     */
    @GetMapping("/pdf/{id}")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        try {
            InvoiceDocument doc = invoiceService.getInvoicePdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.inline()
                            .filename(doc.getFileName())
                            .build());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(doc.getPdfData());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
} 