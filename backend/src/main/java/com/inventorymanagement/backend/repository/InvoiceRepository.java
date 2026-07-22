package com.inventorymanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.inventorymanagement.backend.Entity.InvoiceDocument;


public interface InvoiceRepository extends JpaRepository<InvoiceDocument, Long> {

}
