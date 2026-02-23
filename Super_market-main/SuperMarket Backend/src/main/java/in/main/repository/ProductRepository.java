package in.main.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import in.main.entities.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long>{

	    List<Product> findByUserId(Long userId);

	    @Query("""
	        SELECT COALESCE(SUM(p.price * p.quantity), 0)
	        FROM Product p
	        WHERE p.user.id = :userId
	    """)
	    Double getInventoryValueByUser(@Param("userId") Long userId);

	    List<Product> findByUserIdAndQuantityLessThan(Long userId, int minStock);

	    List<Product> findByPublishedTrue();

	    Optional<Product> findByBarcode(String barcode);

		List<Product> findByUserEmailAndPublishedTrue(String email);

		Optional<Product> findByBarcodeAndUserEmail(String barcode, String email);
		List<Product> findByUserIdAndPublishedTrue(Long userId);

		Product findTopByUserIdOrderByIdDesc(Long userId);

		// High-speed batch operations for ultra-fast billing
		@Query("SELECT p FROM Product p WHERE p.id IN :ids")
		List<Product> findAllByIdIn(@Param("ids") Set<Long> ids);

		@Modifying
		@Query("UPDATE Product p SET p.quantity = p.quantity - :qty, p.sold = COALESCE(p.sold, 0) + :qty WHERE p.id = :id AND p.quantity >= :qty")
		int updateStockAndSold(@Param("id") Long id, @Param("qty") int qty);

		@Query("SELECT p.id, p.quantity FROM Product p WHERE p.id IN :ids")
		List<Object[]> getStockInfoForProducts(@Param("ids") Set<Long> ids);

}
