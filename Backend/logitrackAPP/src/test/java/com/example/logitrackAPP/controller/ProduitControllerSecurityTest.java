package com.example.logitrackAPP.controller;

import com.example.logitrackAPP.Security.JwtAuthenticationFilter;
import com.example.logitrackAPP.Security.JwtService;
import com.example.logitrackAPP.config.SecurityConfig;
import com.example.logitrackAPP.exception.GlobalExceptionHandler;
import com.example.logitrackAPP.model.Produit;
import com.example.logitrackAPP.repository.UserRepository;
import com.example.logitrackAPP.service.ProduitService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProduitController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        GlobalExceptionHandler.class
})
class ProduitControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProduitService produitService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtService jwtService;

    @Test
    @WithMockUser(roles = "AGENT")
    void agentPeutConsulterLesProduits()
            throws Exception {

        when(produitService.afficherTous())
                .thenReturn(List.of());

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "AGENT")
    void agentNePeutPasAjouterProduit()
            throws Exception {

        String json = """
                {
                  "nom": "Clavier",
                  "categorie": "Informatique",
                  "prix": 250,
                  "quantiteStock": 10
                }
                """;

        mockMvc.perform(
                        post("/api/products")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(json)
                )
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void managerPeutAjouterProduit()
            throws Exception {

        Produit produit = new Produit();
        produit.setId(1L);
        produit.setNom("Clavier");
        produit.setCategorie("Informatique");
        produit.setPrix(250);
        produit.setQuantiteStock(10);

        when(produitService.ajouter(
                any(Produit.class)
        )).thenReturn(produit);

        String json = """
                {
                  "nom": "Clavier",
                  "categorie": "Informatique",
                  "prix": 250,
                  "quantiteStock": 10
                }
                """;

        mockMvc.perform(
                        post("/api/products")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(json)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.nom")
                                .value("Clavier")
                );
    }

    @Test
    void utilisateurNonConnecteEstRefuse()
            throws Exception {

        mockMvc.perform(get("/api/products"))
                .andExpect(
                        status().isUnauthorized()
                );
    }
}