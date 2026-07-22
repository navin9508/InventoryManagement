package com.inventorymanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.inventorymanagement.backend.Entity.Products;

public interface ProductRepository extends JpaRepository<Products, Long> {

}
