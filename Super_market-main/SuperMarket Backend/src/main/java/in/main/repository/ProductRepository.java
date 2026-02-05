package in.main.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
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

}
