package com.example.logitrackAPP.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * Gestion des erreurs produites par :
     * @NotBlank, @Email, @Positive, @NotNull...
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> gererValidation(MethodArgumentNotValidException exception) {

        Map<String, String> erreursValidation =
                new LinkedHashMap<>();

        exception.getBindingResult().getFieldErrors().forEach(erreur -> erreursValidation.put(erreur.getField(), erreur.getDefaultMessage()));

        Map<String, Object> reponse = new LinkedHashMap<>();

        reponse.put("timestamp", LocalDateTime.now());
        reponse.put("status", HttpStatus.BAD_REQUEST.value());
        reponse.put("message", "Les données envoyées sont invalides");
        reponse.put("erreurs", erreursValidation);

        return ResponseEntity.badRequest().body(reponse);
    }

    /*
     * Gestion des RuntimeException présentes
     * dans les services.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> gererRuntimeException(RuntimeException exception) {

        Map<String, Object> reponse = new LinkedHashMap<>();

        reponse.put("timestamp", LocalDateTime.now());
        reponse.put("status", HttpStatus.BAD_REQUEST.value());
        reponse.put("message", exception.getMessage());

        return ResponseEntity.badRequest().body(reponse);
    }
}