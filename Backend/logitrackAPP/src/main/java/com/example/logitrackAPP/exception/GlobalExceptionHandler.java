package com.example.logitrackAPP.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> gererValidation(
            MethodArgumentNotValidException exception
    ) {

        Map<String, String> erreurs = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(erreur ->
                        erreurs.put(
                                erreur.getField(),
                                erreur.getDefaultMessage()
                        )
                );

        Map<String, Object> reponse = creerReponse(
                HttpStatus.BAD_REQUEST.value(),
                "Les données envoyées sont invalides"
        );

        reponse.put("erreurs", erreurs);

        return ResponseEntity
                .badRequest()
                .body(reponse);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> gererJsonIncorrect(
            HttpMessageNotReadableException exception
    ) {

        return ResponseEntity
                .badRequest()
                .body(creerReponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "Le JSON envoyé est incorrect ou contient une valeur invalide"
                ));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> gererParametreIncorrect(
            MethodArgumentTypeMismatchException exception
    ) {

        return ResponseEntity
                .badRequest()
                .body(creerReponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "La valeur du paramètre "
                                + exception.getName()
                                + " est invalide"
                ));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> gererIntrouvable(
            ResourceNotFoundException exception
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(creerReponse(
                        HttpStatus.NOT_FOUND.value(),
                        exception.getMessage()
                ));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> gererMetier(
            BusinessException exception
    ) {

        return ResponseEntity
                .badRequest()
                .body(creerReponse(
                        HttpStatus.BAD_REQUEST.value(),
                        exception.getMessage()
                ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> gererConflitBaseDeDonnees(
            DataIntegrityViolationException exception
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(creerReponse(
                        HttpStatus.CONFLICT.value(),
                        "Impossible de supprimer cet élément car il est utilisé par d'autres données"
                ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> gererStatus(
            ResponseStatusException exception
    ) {

        int statut = exception.getStatusCode().value();

        return ResponseEntity
                .status(exception.getStatusCode())
                .body(creerReponse(
                        statut,
                        exception.getReason()
                ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> gererAccesInterdit(
            AccessDeniedException exception
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(creerReponse(
                        HttpStatus.FORBIDDEN.value(),
                        "Vous n'avez pas l'autorisation"
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> gererErreurInterne(
            Exception exception
    ) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(creerReponse(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Une erreur interne est survenue"
                ));
    }

    private Map<String, Object> creerReponse(
            int statut,
            String message
    ) {

        Map<String, Object> reponse = new LinkedHashMap<>();

        reponse.put("timestamp", LocalDateTime.now());
        reponse.put("status", statut);
        reponse.put("message", message);

        return reponse;
    }
}