package com.cinema.controller;

import com.cinema.model.Order;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {
    private List<Order> liveOrders = new ArrayList<>();

    @GetMapping("/orders/live")
    public List<Order> getLiveOrders() {
        return liveOrders;
    }

    @PostMapping("/order")
    public Map<String, Object> placeOrder(@RequestBody Order order) {
        Random rand = new Random();
        String orderId = "SEAT-" + order.getSeatNumber() + "-" + (rand.nextInt(900000) + 100000);
        order.setId(orderId);
        order.setStatus("Preparing");
        liveOrders.add(order);

        return Map.of(
            "success", true,
            "orderId", orderId,
            "message", "Order placed successfully in Java Backend!"
        );
    }

    @PutMapping("/orders/{id}/deliver")
    public Map<String, Boolean> deliverOrder(@PathVariable String id) {
        for (Order o : liveOrders) {
            if (o.getId().equals(id)) {
                o.setStatus("Delivered");
                return Map.of("success", true);
            }
        }
        return Map.of("success", false);
    }

    @PutMapping("/orders/{id}/confirm")
    public Map<String, Boolean> confirmOrder(@PathVariable String id) {
        boolean removed = liveOrders.removeIf(o -> o.getId().equals(id));
        return Map.of("success", removed);
    }
}
