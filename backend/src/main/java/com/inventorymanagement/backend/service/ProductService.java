package com.inventorymanagement.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inventorymanagement.backend.Entity.Products;
import com.inventorymanagement.backend.repository.ProductRepository;

@Service
public class ProductService {
	@Autowired
	private ProductRepository productrepository;
	
	public List<Products> getAllProducts(){
		
		List<Products> products = productrepository.findAll();
		return  products;
	}
	
	public Products updateproduct(Long id,Products updateproduct) {

        Products product = productrepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStock(updateproduct.getStock());
        product.setUpdatedDate(updateproduct.getUpdatedDate());
        
        System.out.println(updateproduct.getStock());
        return productrepository.save(product);
	}

}
