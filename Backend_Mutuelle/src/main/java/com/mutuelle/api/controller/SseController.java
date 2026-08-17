package com.mutuelle.api.controller;

import com.mutuelle.api.event.DataChangeNotifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class SseController {

    @Autowired
    private DataChangeNotifier dataChangeNotifier;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return dataChangeNotifier.subscribe();
    }

    @Scheduled(fixedDelay = 30_000)
    public void heartbeat() {
        dataChangeNotifier.sendHeartbeat();
    }
}
