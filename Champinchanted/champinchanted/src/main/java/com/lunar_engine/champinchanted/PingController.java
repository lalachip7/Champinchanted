package com.lunar_engine.champinchanted;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PingController {

    @GetMapping("/api/ping")
    public ResponseEntity<Void> ping() {
        return ResponseEntity.ok().build();
    }
}