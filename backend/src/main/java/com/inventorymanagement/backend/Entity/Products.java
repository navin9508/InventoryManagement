package com.inventorymanagement.backend.Entity;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
public class Products {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long product_id;
	
	@NotBlank(message = "Name Field Required")
	private String name;
	@NotNull(message = "Price Detail Required")
	@PositiveOrZero(message = "Price must be greater than or zero")
	private Double price;
	private Long stock;
	private Long minStock;
	private Date updatedDate;
	private String category;
	
	public Products() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Long getId() {
		return product_id;
	}
	public void setId(Long id) {
		this.product_id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Double getPrice() {
		return price;
	}
	public void setPrice(Double price) {
		this.price = price;
	}
	public Long getStock() {
		return stock;
	}
	public void setStock(Long stock) {
		this.stock = stock;
	}
	public Long getMinStock() {
		return minStock;
	}
	public void setMinStock(Long minStock) {
		this.minStock = minStock;
	}
	public Date getUpdatedDate() {
		return updatedDate;
	}
	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public Products(Long id, @NotBlank(message = "Name Field Required") String name,
			@NotNull(message = "Price Detail Required") @PositiveOrZero(message = "Price must be greater than or zero") Double price,
			Long stock, Long minStock, Date updatedDate, String category) {
		super();
		this.product_id = id;
		this.name = name;
		this.price = price;
		this.stock = stock;
		this.minStock = minStock;
		this.updatedDate = updatedDate;
		this.category = category;
	}
	
	
}
