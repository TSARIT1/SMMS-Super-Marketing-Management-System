package in.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import in.main.entities.Order;
@Repository
public interface OrderRepository extends JpaRepository<Order,Long>{

	    List<Order> findByUserId(Long userId);

	    @Query("""
	        SELECT COALESCE(SUM(o.total), 0)
	        FROM Order o
	        WHERE o.user.id = :userId
	    """)
	    Double getTotalSalesByUser(@Param("userId") Long userId);
	  
	    Order findTopByUserIdOrderByIdDesc(Long userId);


}
