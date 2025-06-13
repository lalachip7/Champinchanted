package com.lunar_engine.champinchanted;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/status")
public class ApiStatusController {
    
    private final ApiStatusService apiStatusService;
    private final long seenThreshold;

    public ApiStatusController(ApiStatusService apiStatusService, long seenThreshold) {
        this.apiStatusService = apiStatusService;
        this.seenThreshold = seenThreshold;
    }

    @GetMapping("/connected-users")
    public ResponseEntity<ConnectedUsersResponse> getConnectedUsers() {     
        int numberOfUsersConnected = this.apiStatusService.numberOfUsersConnected(this.seenThreshold);
        return ResponseEntity.ok(new ConnectedUsersResponse(numberOfUsersConnected));
    }
    
    public record ConnectedUsersResponse (int numberOfConnectedUsers) {}
}
