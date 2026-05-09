package com.cinema.controller;

import com.cinema.model.MenuItem;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {
    private List<MenuItem> menuItems = new ArrayList<>();
    private AtomicLong counter = new AtomicLong(7);

    public MenuController() {
        menuItems.add(new MenuItem(1L, "Classic Popcorn", 8.5, "Snacks", "Freshly popped with premium butter.", "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?q=80&w=400&h=300&fit=crop"));
        menuItems.add(new MenuItem(2L, "Nachos with Extra Cheese", 10.0, "Snacks", "Crispy chips with warm jalapeño cheese dip.", "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=400&h=300&fit=crop"));
        menuItems.add(new MenuItem(3L, "Gourmet Hot Dog", 9.0, "Snacks", "All-beef frank with your choice of toppings.", "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?q=80&w=400&h=300&fit=crop"));
        menuItems.add(new MenuItem(4L, "Large Soda", 6.5, "Drinks", "Refreshing fountain drink of your choice.", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&h=300&fit=crop"));
        menuItems.add(new MenuItem(5L, "Craft Iced Tea", 7.0, "Drinks", "House-made blend with a hint of lemon.", "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=400&h=300&fit=crop"));
        menuItems.add(new MenuItem(6L, "Blockbuster Combo", 22.0, "Combos", "Large popcorn, 2 large sodas, and a candy pack.", "https://images.unsplash.com/photo-1585647347384-2593bcac5503?q=80&w=400&h=300&fit=crop"));
    }

    @GetMapping
    public List<MenuItem> getMenu() {
        return menuItems;
    }

    @PostMapping
    public MenuItem addItem(@RequestBody MenuItem item) {
        item.setId(counter.getAndIncrement());
        menuItems.add(item);
        return item;
    }

    @PutMapping("/{id}")
    public MenuItem updateItem(@PathVariable Long id, @RequestBody MenuItem item) {
        for (int i = 0; i < menuItems.size(); i++) {
            if (menuItems.get(i).getId().equals(id)) {
                item.setId(id);
                menuItems.set(i, item);
                return item;
            }
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        menuItems.removeIf(i -> i.getId().equals(id));
    }
}
