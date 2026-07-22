package com.inventorymanagement.backend.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Customer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long customerId;
	
	private String name;
	private Long phone;
	private String address;
	private String invoicecount;
	public Customer() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Customer(Long customerId,String name, Long phone, String address, String invoicecount) {
		super();
		this.customerId = customerId;
		this.name = name;
		this.phone = phone;
		this.address = address;
		this.invoicecount = invoicecount;
	}
	
	public Long getCustomerId() {
		return customerId;
	}
	public void setCustomerId(Long customerId) {
		this.customerId = customerId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Long getPhone() {
		return phone;
	}
	public void setPhone(Long phone) {
		this.phone = phone;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getInvoicecount() {
		return invoicecount;
	}
	public void setInvoicecount(String invoicecount) {
		this.invoicecount = invoicecount;
	}

}
