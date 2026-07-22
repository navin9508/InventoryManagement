package com.inventorymanagement.backend.Entity;

import jakarta.persistence.*;

@Entity
public class InvoiceDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNo;

    private String fileName;

    private String contentType;

    @Lob
    @Column(columnDefinition = "BLOB")
    private byte[] pdfData;

	public InvoiceDocument() {
		super();
		// TODO Auto-generated constructor stub
	}

	public InvoiceDocument(Long id, String invoiceNo, String fileName, String contentType, byte[] pdfData) {
		super();
		this.id = id;
		this.invoiceNo = invoiceNo;
		this.fileName = fileName;
		this.contentType = contentType;
		this.pdfData = pdfData;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getInvoiceNo() {
		return invoiceNo;
	}

	public void setInvoiceNo(String invoiceNo) {
		this.invoiceNo = invoiceNo;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public byte[] getPdfData() {
		return pdfData;
	}

	public void setPdfData(byte[] pdfData) {
		this.pdfData = pdfData;
	}

    // getters setters
}