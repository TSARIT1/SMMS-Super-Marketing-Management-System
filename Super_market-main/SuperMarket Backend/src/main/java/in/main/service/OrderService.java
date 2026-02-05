package in.main.service;

import in.main.dto.OrderRequest;
import in.main.entities.Order;
import in.main.entities.User;

public interface OrderService {

    Order placeOrder(OrderRequest request, User user);
    String generateNextOrderNumber(Long userId);
    java.util.List<Order> getOrdersForUser(Long userId);

}
