package com.inventorymanagement.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inventorymanagement.backend.Entity.Customer;
import com.inventorymanagement.backend.repository.CustomerRepository;

@Service
public class CustomerService {

	@Autowired
	CustomerRepository customerrepository;

	public List<Customer> getAllCustomers() {
		List<Customer> customers = customerrepository.findAll();
		return customers;
	}

}
