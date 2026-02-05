package in.main.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

        Order order = new Order();
        order.setCustomer(request.getCustomerName());
        order.setDate(LocalDateTime.now());
        order.setTotal(request.getTotalAmount());
        order.setUser(user);

        int totalItems = 0;

        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest reqItem : request.getItems()) {

            Product product = productRepo.findById(reqItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getQuantity() < reqItem.getQuantity()) {
                throw new RuntimeException(
                    "Insufficient stock for " + product.getName()
                );
            }

            // 🔻 Reduce stock
            product.setQuantity(product.getQuantity() - reqItem.getQuantity());
            productRepo.save(product);

            OrderItem item = new OrderItem();
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setQuantity(reqItem.getQuantity());
            item.setOrder(order);

            totalItems += reqItem.getQuantity();
            orderItems.add(item);
        }

        order.setItems(totalItems);
        order.setOrderItems(orderItems);
        Order savedOrder = orderRepo.save(order);

        /* 🔹 AUTO-CREATE PAYMENT*/
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setMethod(request.getPaymentMethod()); // 🔥 THIS IS THE FIX
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
    	    next = Integer.parseInt(lastOrder.getOrderNumber().substring(4)) + 1;
    	}

    	return String.format("ORD-%03d", next);

    }

    @Override
    public List<Order> getOrdersForUser(Long userId) {
        return orderRepo.findByUserId(userId);
    }

}

