package com.example.chatgptspringboot.controller;

import com.theokanning.openai.audio.CreateTranscriptionRequest;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
public class MyController {

        @Value("${openai.api.key}")
        private String apiKey;

        private final OpenAiService service;

        // Use constructor injection for the OpenAiService
        public MyController(@Value("${openai.api.key}") String apiKey) {
            this.service = new OpenAiService(apiKey);
        }



    @GetMapping("/audio")
    public String audio(@RequestParam String filePath){
        OpenAiService service = new OpenAiService(apiKey);

        CreateTranscriptionRequest request = new CreateTranscriptionRequest();
        request.setModel("whisper-1");
        File file = new File(filePath);
        String transcription = service.createTranscription(request,filePath).getText();
        return transcription;
    }

    @PostMapping("/audio")
    public String audio(@RequestParam("file") MultipartFile file) {
        OpenAiService service = new OpenAiService(apiKey);
        CreateTranscriptionRequest request = new CreateTranscriptionRequest();
        request.setModel("whisper-1");

        try {
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf("."));

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(fileName);

            file.transferTo(filePath);

            // Création de la transcription
            String transcription = service.createTranscription(request, filePath.toString()).getText();

            Files.delete(filePath);

            return transcription;
        } catch (IOException e) {
            // Gestion des exceptions
            e.printStackTrace();
            return "Erreur lors de la transcription du fichier";
        }
    }
}
