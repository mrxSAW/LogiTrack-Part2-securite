package com.example.logitrackAPP.service;

import com.example.logitrackAPP.model.Client;
import com.example.logitrackAPP.repository.ClientRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository repo;

    public ClientService(ClientRepository repo) {
        this.repo = repo;
    }

    public Client save(Client c) {
        return repo.save(c);
    }

    public List<Client> getAll() {
        return repo.findAll();
    }

    public Client getById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }



    public Client update(Long id, Client nouveauClient) {

        Client clientExistant = repo.findById(id).orElseThrow(() -> new RuntimeException("Client non trouvé"));

        clientExistant.setNom(nouveauClient.getNom());
        clientExistant.setEmail(nouveauClient.getEmail());
        clientExistant.setTelephone(
                nouveauClient.getTelephone()
        );
        clientExistant.setVille(nouveauClient.getVille());

        return repo.save(clientExistant);
    }


    public List<Client> rechercher(String motCle) {

        if (motCle == null || motCle.trim().isEmpty()) {
            return repo.findAll();
        }

        String recherche = motCle.trim();

        return repo.findByNomContainingIgnoreCaseOrEmailContainingIgnoreCaseOrVilleContainingIgnoreCase(
                        recherche, recherche, recherche
                );
    }


    public Page<Client> afficherAvecPagination(Pageable pageable) {
        return repo.findAll(pageable);
    }

}