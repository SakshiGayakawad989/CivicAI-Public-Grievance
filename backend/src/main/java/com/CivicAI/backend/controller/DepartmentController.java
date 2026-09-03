package com.CivicAI.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CivicAI.backend.entity.Department;
import com.CivicAI.backend.service.DepartmentService;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(
            @RequestBody Department department) {

        Department savedDepartment =
                departmentService.createDepartment(department);

        return ResponseEntity.ok(savedDepartment);
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {

        List<Department> departments =
                departmentService.getAllDepartments();

        return ResponseEntity.ok(departments);
    }
}