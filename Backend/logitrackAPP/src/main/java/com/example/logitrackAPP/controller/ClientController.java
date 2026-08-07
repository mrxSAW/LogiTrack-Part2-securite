package com.example.logitrackAPP.controller;

import com.example.logitrackAPP.model.Client;
import com.example.logitrackAPP.service.ClientService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService service;

    public ClientController(ClientService service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public Client add(@Valid @RequestBody Client client) {
        return service.save(client);
    }

    @PreAuthorize("hasAnyRole('ADMIN','AGENT', 'MANAGER')")
    @GetMapping
    public List<Client> all() {
        return service.getAll();
    }

    @PreAuthorize("hasAnyRole('ADMIN','AGENT', 'MANAGER')")
    @GetMapping("/{id}")
    public Client one(@PathVariable Long id) {
        return service.getById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public Client update(@PathVariable Long id, @Valid  @RequestBody Client client) {
        return service.update(id, client);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }



    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @GetMapping("/search")
    public List<Client> rechercher(@RequestParam String keyword) {
        return service.rechercher(keyword);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @GetMapping("/page")
    public Page<Client> afficherAvecPagination(@ParameterObject Pageable pageable) {
        return service.afficherAvecPagination(pageable);
    }
}