package com.inventorymanagement.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.inventorymanagement.backend.Entity.Products;
import com.inventorymanagement.backend.repository.ProductRepository;
import com.inventorymanagement.backend.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class Productcontroller {
	@Autowired
	private ProductService productservice;
	
	@Autowired
	private ProductRepository productrepository;
	
	@GetMapping
	public ResponseEntity<List<Products>> getproducts(){
		List<Products> products=productservice.getAllProducts();	
		return ResponseEntity.ok(products);
	}
	
	@PostMapping
	public Products saveproduct(@RequestBody Products product){
		
		System.out.println(product.getId());
		System.out.println(product.getPrice());
		System.out.println(product.getStock());
		System.out.println(product.getUpdatedDate());
		System.out.println(product.getMinStock());
		return productrepository.save(product);
	}
	
	@PatchMapping("/{id}")
	public ResponseEntity<Products> updateroduct( @PathVariable Long id,
            @RequestBody Products product) {
     Products updatedProduct =
             productservice.updateproduct(id, product);
     		System.out.println(id);
     return ResponseEntity.ok(updatedProduct);
         }
}
