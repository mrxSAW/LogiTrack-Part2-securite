package com.example.logitrackAPP.controller;

import com.example.logitrackAPP.dto.AjouterProduitCommandeRequest;
import com.example.logitrackAPP.dto.ChangerStatutRequest;
import com.example.logitrackAPP.model.Commande;
import com.example.logitrackAPP.model.StatutCommande;
import com.example.logitrackAPP.service.CommandeService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/orders")
public class CommandeController {

    private final CommandeService service;

    public CommandeController(CommandeService service) {
        this.service = service;
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<Commande> createOrder(@RequestParam("clientId") Long clientId) {
        return ResponseEntity.ok(service.createOrder(clientId));
    }


    @PreAuthorize("hasAnyRole('MANAGER')")
    @GetMapping
    public LocalDate RetureneDateEncienne(@RequestParam Long id1, @ Long Id2){




    }




    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{orderId}/products")
    public ResponseEntity<Commande> ajouterProduit(@PathVariable Long orderId,  @Valid @RequestBody AjouterProduitCommandeRequest request) {

        return ResponseEntity.ok(service.ajouterProduit(orderId, request));
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @GetMapping
    public List<Commande> afficher() {
        return service.afficherToutes();
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @GetMapping("/{id}")
    public Commande get(@PathVariable Long id) {
        return service.getById(id);
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @PutMapping("/{id}/status")
    public ResponseEntity<Commande> changerStatut(@PathVariable Long id, @Valid  @RequestBody ChangerStatutRequest request) {

        return ResponseEntity.ok(service.changerStatut(id, request.getStatut()));
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/count")
    public long count() {
        return service.countCommandes();
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @GetMapping("/filter")
    public List<Commande> filtrer(@RequestParam(required = false) Long clientId, @RequestParam(required = false) StatutCommande statut) {
        return service.filtrer(clientId, statut);
    }



    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @GetMapping("/page")
    public Page<Commande> afficherAvecPagination(@ParameterObject Pageable pageable) {
        return service.afficherAvecPagination(pageable);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {

        service.supprimer(id);

        return ResponseEntity.noContent().build();
    }


}