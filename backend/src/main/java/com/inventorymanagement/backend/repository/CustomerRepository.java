package com.inventorymanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.inventorymanagement.backend.Entity.Customer;

public interface CustomerRepository  extends JpaRepository<Customer, Long> {

}
