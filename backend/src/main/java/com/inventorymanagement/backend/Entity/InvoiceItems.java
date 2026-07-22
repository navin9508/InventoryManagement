package com.inventorymanagement.backend.Entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
public class InvoiceItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // product name shown on the invoice line

    private Integer qty;

    private String unit; // e.g. "Roll", "Box", "Kg"

    private BigDecimal unitPrice;

    private BigDecimal amount; // qty * unitPrice, stored explicitly rather than computed at render time

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    public InvoiceItems() {
        super();
    }

    public InvoiceItems(Long id, String name, Integer qty, String unit, BigDecimal unitPrice, BigDecimal amount) {
        super();
        this.id = id;
        this.name = name;
        this.qty = qty;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.amount = amount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getQty() {
        return qty;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }
}