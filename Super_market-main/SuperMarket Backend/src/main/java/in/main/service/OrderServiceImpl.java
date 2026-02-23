package in.main.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.main.dto.OrderItemRequest;
import in.main.dto.OrderRequest;
import in.main.entities.Order;
import in.main.entities.OrderItem;
import in.main.entities.Payment;
import in.main.entities.Product;
import in.main.entities.User;
import in.main.repository.OrderRepository;
import in.main.repository.PaymentRepository;
import in.main.repository.ProductRepository;
import jakarta.transaction.Transactional;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private AIService aiService;


    @Override
    @Transactional
    public Order placeOrder(OrderRequest request, User user) {
        // Extract all product IDs for batch fetching
        Set<Long> productIds = request.getItems().stream()
                .map(OrderItemRequest::getProductId)
                .collect(Collectors.toSet());

        // BATCH FETCH: Single query instead of N queries
        List<Product> products = productRepo.findAllByIdIn(productIds);
        Map<Long, Product> productMap = new HashMap<>();
        for (Product p : products) {
            productMap.put(p.getId(), p);
        }

        // Validate stock in memory (ultra-fast)
        for (OrderItemRequest reqItem : request.getItems()) {
            Product product = productMap.get(reqItem.getProductId());
            if (product == null) {
                throw new RuntimeException("Product not found: " + reqItem.getProductId());
            }
            if (product.getQuantity() < reqItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName());
            }
        }

        Order order = new Order();
        order.setCustomer(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setDate(LocalDateTime.now());
        order.setUser(user);
        order.setOrderNumber(generateNextOrderNumber(user.getId()));
        order.setTaxAmount(request.getTaxAmount());

        int totalItems = 0;
        double serverCalculatedTotal = 0;
        double mrpTotal = 0;
        double discountTotal = 0;

        List<OrderItem> orderItems = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();

        for (OrderItemRequest reqItem : request.getItems()) {
            Product product = productMap.get(reqItem.getProductId());

            // Update stock in memory
            product.setQuantity(product.getQuantity() - reqItem.getQuantity());
            product.setSold((product.getSold() == null ? 0 : product.getSold()) + reqItem.getQuantity());
            productsToUpdate.add(product);

            OrderItem item = new OrderItem();
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            
            // Use client-provided prices if available (for custom/edited prices), otherwise use product prices
            Double itemMrp = reqItem.getMrp() != null ? reqItem.getMrp() : product.getPrice();
            Double unitNetPrice = reqItem.getNetPrice() != null ? reqItem.getNetPrice() : 
                                  (product.getNetRate() != null ? product.getNetRate() : product.getPrice());
            Double unitPrice = unitNetPrice;
            
            item.setPrice(unitPrice);
            item.setMrp(itemMrp);
            item.setNetPrice(unitNetPrice);
            item.setQuantity(reqItem.getQuantity());
            item.setOrder(order);

            totalItems += reqItem.getQuantity();
            serverCalculatedTotal += unitPrice * reqItem.getQuantity();
            mrpTotal += (itemMrp == null ? 0.0 : itemMrp) * reqItem.getQuantity();
            discountTotal += ((itemMrp == null ? 0.0 : itemMrp) - unitPrice) * reqItem.getQuantity();
            orderItems.add(item);
        }

        // BATCH SAVE: Single query for all products
        productRepo.saveAll(productsToUpdate);

        double finalTotal = serverCalculatedTotal > 0 ? Math.max(serverCalculatedTotal, request.getTotalAmount()) : request.getTotalAmount();
        order.setTotal(finalTotal);
        order.setMrpTotal(mrpTotal);
        order.setDiscount(discountTotal);
        order.setItems(totalItems);
        order.setOrderItems(orderItems);
        Order savedOrder = orderRepo.save(order);

        // Create payment
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setMethod(request.getPaymentMethod());
        payment.setStatus("SUCCESS");
        payment.setAmount(savedOrder.getTotal());
        payment.setTransactionId("TXN-" + System.currentTimeMillis());
        paymentRepo.save(payment);

        return savedOrder;
    }

    @Override
    public String generateNextOrderNumber(Long userId) {
        Order lastOrder = orderRepo.findTopByUserIdOrderByIdDesc(userId);
        int next = 1;
        if (lastOrder != null && lastOrder.getOrderNumber() != null) {
            try {
                next = Integer.parseInt(lastOrder.getOrderNumber().substring(4)) + 1;
            } catch (Exception e) {
                next = orderRepo.findByUserId(userId).size() + 1;
            }
        }
        return String.format("ORD-%03d", next);
    }

    @Override
    public List<Order> getOrdersForUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }

}