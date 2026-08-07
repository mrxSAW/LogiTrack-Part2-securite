package com.example.logitrackAPP.service;

import com.example.logitrackAPP.exception.ResourceNotFoundException;
import com.example.logitrackAPP.model.Client;
import com.example.logitrackAPP.repository.ClientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository repository;

    public ClientService(ClientRepository repository) {
        this.repository = repository;
    }

    public Client save(Client client) {
        return repository.save(client);
    }

    public List<Client> getAll() {
        return repository.findAll();
    }

    public Client getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));
    }

    public Client update(Long id, Client nouveauClient) {

        Client clientExistant = getById(id);

        clientExistant.setNom(nouveauClient.getNom());
        clientExistant.setEmail(nouveauClient.getEmail());
        clientExistant.setTelephone(nouveauClient.getTelephone());
        clientExistant.setVille(nouveauClient.getVille());

        return repository.save(clientExistant);
    }

    public void delete(Long id) {

        Client client = getById(id);

        repository.delete(client);
    }

    public List<Client> rechercher(String motCle) {

        if (motCle == null || motCle.trim().isEmpty()) {
            return repository.findAll();
        }

        String recherche = motCle.trim();

        return repository.findByNomContainingIgnoreCaseOrEmailContainingIgnoreCaseOrVilleContainingIgnoreCase(

                recherche, recherche, recherche);
    }

    public Page<Client> afficherAvecPagination(Pageable pageable) {
        return repository.findAll(pageable);
    }




}