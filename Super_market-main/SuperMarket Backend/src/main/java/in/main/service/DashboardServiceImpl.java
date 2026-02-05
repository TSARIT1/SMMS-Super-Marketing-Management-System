package in.main.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.main.dto.DashboardResponse;
import in.main.dto.OrderResponse;
import in.main.dto.ProductResponse;
import in.main.entities.Order;
import in.main.entities.Product;
import in.main.repository.OrderRepository;
import in.main.repository.ProductRepository;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Override
    public DashboardResponse getDashboardData(Long userId) {

        List<Product> products = productRepo.findByUserId(userId);
        List<Order> orders = orderRepo.findByUserId(userId);

        DashboardResponse response = new DashboardResponse();

        // ---------------- TOTALS ----------------

        response.setTotalRevenue(
            orders.stream()
                .mapToDouble(o -> o.getTotal())
                .sum()
        );

        response.setInventoryValue(
            products.stream()
                .mapToDouble(p ->
                    (p.getPrice() == null ? 0.0 : p.getPrice()) *
                    (p.getQuantity() == null ? 0 : p.getQuantity())
                )
                .sum()
        );

        response.setTotalSold(
            products.stream()
                .mapToInt(p -> p.getSold() == null ? 0 : p.getSold())
                .sum()
        );

        // ---------------- PRODUCTS ----------------

        response.setLowStockProducts(
            products.stream()
                .filter(p ->
                    p.getQuantity() != null &&
                    p.getMinStock() != null &&
                    p.getQuantity() > 0 &&
                    p.getQuantity() < p.getMinStock()
                )
                .map(this::toProductResponse)
                .collect(Collectors.toList())
        );

        response.setOutOfStockProducts(
            products.stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() == 0)
                .map(this::toProductResponse)
                .collect(Collectors.toList())
        );

        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);

        response.setExpiringSoonProducts(
            products.stream()
                .filter(p -> p.getExpiryDate() != null)
                .filter(p ->
                    !p.getExpiryDate().isBefore(today) &&
                    !p.getExpiryDate().isAfter(nextWeek)
                )
                .map(this::toProductResponse)
                .collect(Collectors.toList())
        );

        response.setTopSellingProducts(
            products.stream()
                .sorted((a, b) ->
                    Integer.compare(
                        b.getSold() == null ? 0 : b.getSold(),
                        a.getSold() == null ? 0 : a.getSold()
                    )
                )
                .limit(5)
                .map(this::toProductResponse)
                .collect(Collectors.toList())
        );

        // Fast Moving Products (high turnover rate: sold/quantity ratio)
        response.setFastMovingProducts(
            products.stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() > 0)
                .filter(p -> p.getSold() != null && p.getSold() > 0)
                .sorted((a, b) -> {
                    double ratioA = (double) a.getSold() / (a.getQuantity() + a.getSold());
                    double ratioB = (double) b.getSold() / (b.getQuantity() + b.getSold());
                    return Double.compare(ratioB, ratioA);
                })
                .limit(5)
                .map(this::toProductResponse)
                .collect(Collectors.toList())
        );

        // ---------------- ORDERS ----------------

        response.setRecentOrders(
            orders.stream()
                .filter(o -> o.getDate() != null)
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .limit(5)
                .map(this::toOrderResponse)
                .collect(Collectors.toList())
        );

        return response;
    }

    // ---------- ENTITY → DTO ----------

    private ProductResponse toProductResponse(Product p) {
        ProductResponse dto = new ProductResponse();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCategory(p.getCategory());
        dto.setBarcode(p.getBarcode());
        dto.setPrice(p.getPrice() == null ? 0.0 : p.getPrice());
        dto.setQuantity(p.getQuantity() == null ? 0 : p.getQuantity());
        dto.setMinStock(p.getMinStock() == null ? 0 : p.getMinStock());
        dto.setSold(p.getSold() == null ? 0 : p.getSold());
        dto.setExpiryDate(
            p.getExpiryDate() != null ? p.getExpiryDate().toString() : null
        );
        return dto;
    }

    private OrderResponse toOrderResponse(Order o) {
        OrderResponse dto = new OrderResponse();
        dto.setId(o.getId());
        dto.setCustomer(o.getCustomer());
        dto.setDate(o.getDate() != null ? o.getDate().toString() : null);
        dto.setItems(o.getItems());
        dto.setTotal(o.getTotal() );
        return dto;
    }
}
