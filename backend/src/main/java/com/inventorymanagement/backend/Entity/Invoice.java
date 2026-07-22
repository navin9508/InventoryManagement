package com.inventorymanagement.backend.Entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNo;

    private String customerName;
 
    @Column(columnDefinition = "TEXT")
    private String billingAddress;

    private String status; // e.g. "Paid", "Unpaid", "Overdue"

    private LocalDate invoiceDate;

    private LocalDate dueDate;

    private String paymentTerms; // e.g. "Net 30"

    private BigDecimal subtotal;

    private BigDecimal cgst;

    private BigDecimal sgst;

    private BigDecimal transport;

    private BigDecimal discount;

    // Final total due — this RAW value (not a formatted "₹" string) is what
    // must be passed into QrCodeService.generateUpiQrBase64(...) for the
    // UPI QR code's `am` parameter.
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvoiceItems> items = new ArrayList<>();

    public Invoice() {
        super();
    }

    public Invoice(Long id, String invoiceNo, String customerName, String billingAddress, String status,
                    LocalDate invoiceDate, LocalDate dueDate, String paymentTerms, BigDecimal subtotal,
                    BigDecimal cgst, BigDecimal sgst, BigDecimal transport, BigDecimal discount,
                    BigDecimal amount, String notes, List<InvoiceItems> items) {
        super();
        this.id = id;
        this.invoiceNo = invoiceNo;
        this.customerName = customerName;
        this.billingAddress = billingAddress;
        this.status = status;
        this.invoiceDate = invoiceDate;
        this.dueDate = dueDate;
        this.paymentTerms = paymentTerms;
        this.subtotal = subtotal;
        this.cgst = cgst;
        this.sgst = sgst;
        this.transport = transport;
        this.discount = discount;
        this.amount = amount;
        this.notes = notes;
        this.items = items != null ? items : new ArrayList<>();
    }

    // Convenience helper to keep both sides of the relationship in sync
    public void addItem(InvoiceItems item) {
        items.add(item);
        item.setInvoice(this);
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

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(String billingAddress) {
        this.billingAddress = billingAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getCgst() {
        return cgst;
    }

    public void setCgst(BigDecimal cgst) {
        this.cgst = cgst;
    }

    public BigDecimal getSgst() {
        return sgst;
    }

    public void setSgst(BigDecimal sgst) {
        this.sgst = sgst;
    }

    public BigDecimal getTransport() {
        return transport;
    }

    public void setTransport(BigDecimal transport) {
        this.transport = transport;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<InvoiceItems> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItems> items) {
        this.items = items;
    }
}