package com.mutuelle.api.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Horloge applicative. Si une date simulée est définie, elle remplace {@link LocalDateTime#now()}.
 * Utile pour tester les échéances et pénalités d'emprunt.
 */
@Component
public class SimulationClock {

    private volatile LocalDateTime dateSimulee;

    public LocalDateTime now() {
        LocalDateTime sim = dateSimulee;
        return sim != null ? sim : LocalDateTime.now();
    }

    public void setDateSimulee(LocalDateTime date) {
        this.dateSimulee = date;
    }

    public void reset() {
        this.dateSimulee = null;
    }

    public boolean isSimulee() {
        return dateSimulee != null;
    }

    public LocalDateTime getDateSimulee() {
        return dateSimulee;
    }
}
