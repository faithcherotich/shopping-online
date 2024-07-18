document.addEventListener('DOMContentLoaded', () => {
   
    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "index.html") {
        loadFeaturedProducts();
        loadLatestBlogPosts();
    } else if (currentPage === "products.html") {
        loadProducts();
        setupFilterForm();
        
    } else if (currentPage === "products-detail.html") {
        loadProductDetail();
        setupReviewForm();
    } else if (currentPage === "blog.html") {
        loadBlogPosts();
    } else if (currentPage === "add-product.html") {
        setupAddProductForm();
    }else if (currentPage === "add-Blog.html"){
        setupAddBlogForm();
    }


   
});
function showFormDisplay(signInBtn, accountForm) {
    const button = document.getElementById(signInBtn);
    const form = document.getElementById(accountForm);

    button.addEventListener('click', () => {
        if (form.style.display === 'none' || form.style.display === '') {
            form.style.display = 'block';
        } else {
            form.style.display = 'none';
        }
    });
}

showFormDisplay("signInBtn","accountForm");


function fetchData(endpoint) {
    return fetch(`http://localhost:3000/${endpoint}`)
        .then(response => response.json());
}

function postData(endpoint, data) {
    return fetch(`http://localhost:3000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(response => response.json());
}


function updateData(endpoint, id, data) {
    return fetch(`http://localhost:3000/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(response => response.json());
}

function deleteData(endpoint, id) {
    return fetch(`http://localhost:3000/${endpoint}/${id}`, { method: 'DELETE' })
        .then(response => response.json());
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'col-md-4 product-card';
    card.innerHTML = `
        <div class="card">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">Ksh ${product.price.toFixed(2)}</p>
                <a href="products-detail.html?id=${product.id}" class="btn btn-primary">View Details</a>
                 <button class="btn btn-success" onclick="buyProduct('${product.id}')">Buy Product</button>
                <button class="btn btn-secondary edit-product" data-id="${product.id}">Edit</button>
                <button class="btn btn-danger delete-product" data-id="${product.id}">Delete</button>
            </div>
        </div>
         <div class="edit-form" style="display: none;">
                <form id="editForm-${product.id}">
                    <input type="hidden" id="editProductId" value="${product.id}">
                    <div class="form-group">
                        <label for="editProductName">Name</label>
                        <input type="text" class="form-control" id="editProductName" value="${product.name}">
                    </div>
                    <div class="form-group">
                        <label for="editProductPrice">Price</label>
                        <input type="number" class="form-control" id="editProductPrice" value="${product.price}">
                    </div>
                    <div class="form-group">
                        <label for="editProductImage">Image URL</label>
                        <input type="text" class="form-control" id="editProductImage" value="${product.image}">
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        </div>
    `;
    card.querySelector('.edit-product').addEventListener('click', () => {
        const editForm = card.querySelector('.edit-form');
        editForm.style.display = 'block';
    });
    const editForm = card.querySelector('form');
    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const productId = parseInt(editForm.querySelector('#editProductId').value);
        const editedProduct = {
            name: editForm.querySelector('#editProductName').value,
            price: parseFloat(editForm.querySelector('#editProductPrice').value),
            image: editForm.querySelector('#editProductImage').value
            // Add other fields as needed
        };

        updateData('products', productId, editedProduct)
            .then(() => {
                alert('Product updated successfully!');
                // Optionally, update the UI or redirect to another page
                editForm.reset();
                editForm.style.display = 'none'; // Hide the form after submission
            })
            .catch(error => console.error('Error updating product:', error));
    });

    return card;
}
function buyProduct(productId) {
    alert(`Product with ID ${productId} has been bought!`);
}
function loadLatestBlogPosts() {
    fetchData().then(latestPosts => {
        const container = document.getElementById('latestBlogPosts');
        latestPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>By ${post.author} on ${new Date(post.date).toLocaleDateString()}</p>
                <p>${post.content}...</p>
            `;
            container.appendChild(postElement);
        });
    });
}
// product.html//
function loadProducts() {
    fetchData('products').then(products => {
        const productList = document.getElementById('productList');
        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = createProductCard(product);
            productList.appendChild(productCard);

            productCard.querySelector('.delete-product').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this product?')) {
                    deleteData('products', product.id).then(() => productCard.remove());
                }
            });

            productCard.querySelector('.edit-product').addEventListener('click', () => loadProductForEdit(product.id));
        });
    });
}
//form in product.html//
function setupFilterForm() {
    const filterForm = document.getElementById('filterForm');
    const priceRange = document.getElementById('priceRange');
    const priceRangeValue = document.getElementById('priceRangeValue');

    priceRange.addEventListener('input', () => {
        priceRangeValue.textContent = `Ksh ${priceRange.value}`;
    });

    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const skinType = document.getElementById('skinType').value;
        const category = document.getElementById('category').value;
        const maxPrice = priceRange.value;

        let url = 'products?';
        if (skinType) url += `skinType=${skinType}&`;
        if (category) url += `category=${category}&`;
        url += `price_lte=${maxPrice}`;

        fetchData(url).then(filteredProducts => {
            const productList = document.getElementById('productList');
            productList.innerHTML = '';
            filteredProducts.forEach(product => {
                productList.appendChild(createProductCard(product));
            });
        });
    });
}
//product-details.html//
function loadProductDetails(productId) {
    fetchData(`products/${productId}`).then(product => {
        const container = document.getElementById('productDetail');
        
        container.innerHTML = `
            <h1>${product.name}</h1>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <p><strong>Price:</strong> Ksh ${product.price.toFixed(2)}</p>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Skin Type:</strong> ${product.skinType}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Description:</strong> ${product.description}</p>
            <p><strong>Ingredients:</strong> ${product.ingredients}</p>
            <p><strong>Usage:</strong> ${product.usage}</p>
            <p><strong>Average Rating:</strong> ${product.averageRating.toFixed(1)}</p>
        `;
        loadReviews(productId);
    });
}

function loadReviews(productId) {
    fetchData(`reviews?productId=${productId}`).then(reviews => {
        const reviewList = document.getElementById('reviewList');
        reviewList.innerHTML = reviews.length === 0 ? '<p>No reviews yet. Be the first to review this product!</p>' : '';

        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.innerHTML = `
                <h4>${review.username}</h4>
                <p>Rating: ${review.rating}/5</p>
                <p>${review.comment}</p>
            `;
            reviewList.appendChild(reviewElement);
        });
    });
}

function setupReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const url = new URLSearchParams(window.location.search);
        const productId = url.get('id');
        const username = document.getElementById('username').value;
        const rating = document.getElementById('rating').value;
        const comment = document.getElementById('comment').value;

        const newReview = {
            productId: parseInt(productId),
            username,
            rating: parseInt(rating),
            comment
        };

        postData('reviews', newReview).then(() => {
            loadReviews(productId);
            reviewForm.reset();
        });
    });
}

function loadProductDetail() {
    const url = new URLSearchParams(window.location.search);
    const productId = url.get('id');
    if (productId) loadProductDetails(productId);
    else console.error('Product ID not found in URL');
}
//blog html//
function loadBlogPosts() {
    fetchData('blogPosts').then(posts => {
        const blogPosts = document.getElementById('blogPosts');
        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>By ${post.date} on ${new Date(post.date).toLocaleDateString()}</p>
                <p>${post.content}</p>
                <p>${post.author}</p>
                <hr>
            `;
            blogPosts.appendChild(postElement);
        });
    });
}

function setupAddProductForm() {
    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newProduct = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            skinType: document.getElementById('productSkinType').value,
            category: document.getElementById('productCategory').value,
            brand: document.getElementById('productBrand').value,
            description: document.getElementById('productDescription').value,
            ingredients: document.getElementById('productIngredients').value,
            usage: document.getElementById('productUsage').value,
            image: document.getElementById('productImage').value
        };

        postData('products', newProduct).then(() => {
            alert('Product added successfully!');
            addProductForm.reset();
        });
    });
}

function loadProductForEdit(productId) {
    fetchData(`products/${productId}`).then(product => {
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductPrice').value = product.price;
        
     });
 }

function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.innerHTML = `
        <h2>${post.title}</h2>
        <p>By ${post.date} on ${new Date(post.date).toLocaleDateString()}</p>
        <p>${post.author}</p>
         <p>${post.content}</p>

        <button class="edit-blog" data-id="${post.id}">Edit</button>
        <button class="delete-blog" data-id="${post.id}">Delete</button>
           </div>
        </div>
        <div class="edit-form" style="display: none;">
            <form id="editForm-${post.id}">
                <input type="hidden" id="editBlogId" value="${post.id}">
                <div>
                    <label for="editBlogTitle">Title:</label>
                    <input type="text" id="editBlogTitle" value="${post.title}" required>
                </div>
                <div>
                    <label for="editBlogAuthor">Author:</label>
                    <input type="text" id="editBlogAuthor" value="${post.author}" required>
                </div>
                <div>
                    <label for="editBlogDate">Date:</label>
                    <input type="date" id="editBlogDate" value="${post.date}" required>
                </div>
                <div>
                    <label for="editBlogContent">Content:</label>
                    <textarea id="editBlogContent" required>${post.content}</textarea>
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    `;

    card.querySelector('.edit-blog').addEventListener('click', () => {
        const editForm = card.querySelector('.edit-form');
        editForm.style.display = editForm.style.display === 'block' ? 'none' : 'block';
    });

    card.querySelector('.delete-blog').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this blog post?')) {
            deleteData('blogPosts', post.id).then(() => card.remove());
        }
    });

    const editForm = card.querySelector('form');
    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const blogId = parseInt(editForm.querySelector('#editBlogId').value);
        const editedBlog = {
            title: editForm.querySelector('#editBlogTitle').value,
            author: editForm.querySelector('#editBlogAuthor').value,
            date: editForm.querySelector('#editBlogDate').value,
            content: editForm.querySelector('#editBlogContent').value
        };

        updateData('blogPosts', blogId, editedBlog).then(() => {
            alert('Blog post updated successfully!');
            editForm.reset();
            editForm.style.display = 'none';
            loadBlogPosts();
        }).catch(error => console.error('Error updating blog post:', error));
    });

    return card;
}

function setupAddBlogForm() {
    const addBlogForm = document.getElementById('addBlogForm');
    addBlogForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newBlog = {
            title: document.getElementById('blogtitle').value,
            author: document.getElementById('blogauthor').value,
            date: document.getElementById('blogdate').value,
            content: document.getElementById('blogcontent').value
        };

        postData('blogPosts', newBlog).then(() => {
            alert('Blog post added successfully!');
            addBlogForm.reset();
            setupAddBlogForm();
        }).catch(error => console.error('Error adding blog post:', error));
    });
}
