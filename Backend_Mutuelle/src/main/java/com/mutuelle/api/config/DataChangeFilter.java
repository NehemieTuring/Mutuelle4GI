package com.mutuelle.api.config;

import com.mutuelle.api.event.DataChangeNotifier;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class DataChangeFilter extends OncePerRequestFilter {

    @Autowired
    private DataChangeNotifier dataChangeNotifier;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/events/")
                || path.startsWith("/api/hello")
                || path.startsWith("/api/simulation/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        filterChain.doFilter(request, response);

        if (isMutation(request.getMethod())) {
            int status = response.getStatus();
            if (status >= 200 && status < 300) {
                String path = request.getRequestURI();
                dataChangeNotifier.notifyChanges(
                        dataChangeNotifier.resolveScopes(path), path);
            }
        }
    }

    private boolean isMutation(String method) {
        return "POST".equals(method)
                || "PUT".equals(method)
                || "PATCH".equals(method)
                || "DELETE".equals(method);
    }
}
