package com.inventorymanagement.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inventorymanagement.backend.Entity.Customer;
import com.inventorymanagement.backend.service.CustomerService;

@RestController
@RequestMapping("/api/customers")
public class Customercontroller {

	@Autowired
	CustomerService customersrvice;
	@GetMapping
	public ResponseEntity<List<Customer>> getproducts() {
		List<Customer> customers = customersrvice.getAllCustomers();
		return ResponseEntity.ok(customers);
	}
}
