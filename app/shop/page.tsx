"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Search, ShoppingCart, Star, Heart, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { getProducts, addToCart, type Product } from "@/lib/data-service"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { database, storage } from "@/lib/firebase-config"
import { ref as dbRef, push, set } from "firebase/database"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"

export default function ShopPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [uploadingProduct, setUploadingProduct] = useState(false)

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Kits",
    description: "",
    inStock: true,
  })
  const [productImage, setProductImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = ["All", "Kits", "Marketing", "Apparel", "Electronics", "Merchandise"]

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const productsData = await getProducts()
        setProducts(productsData)
      } catch (error) {
        console.error("Error loading products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "All" || product.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      })
      return
    }

    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently unavailable",
        variant: "destructive",
      })
      return
    }

    try {
      setAddingToCart(product.id)
      const success = await addToCart(user.uid, product.id)

      if (success) {
        setCartCount((prev) => prev + 1)
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart`,
        })
      } else {
        throw new Error("Failed to add to cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  const handleAddToFavorites = (productId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to favorites",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Added to Favorites",
      description: "Product has been added to your favorites",
    })
  }

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImage(e.target.files[0])
    }
  }

  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setNewProduct((prev) => ({
      ...prev,
      category: value,
    }))
  }

  const handleAddProduct = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add products",
        variant: "destructive",
      })
      return
    }

    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Missing Information",
        description: "Please provide a product name and price",
        variant: "destructive",
      })
      return
    }

    setUploadingProduct(true)

    try {
      let imageUrl = "/placeholder.svg"

      // Upload image if provided
      if (productImage) {
        const imageStorageRef = storageRef(storage, `products/${user.uid}/${Date.now()}_${productImage.name}`)
        await uploadBytes(imageStorageRef, productImage)
        imageUrl = await getDownloadURL(imageStorageRef)
      }

      // Add product to Firebase Realtime Database
      const productsRef = dbRef(database, "products")
      const newProductRef = push(productsRef)

      const productData = {
        id: newProductRef.key,
        name: newProduct.name,
        price: Number.parseFloat(newProduct.price),
        category: newProduct.category,
        description: newProduct.description || "",
        image: imageUrl,
        inStock: true,
        rating: 5.0,
        sellerId: user.uid,
        createdAt: new Date().toISOString(),
      }

      await set(newProductRef, productData)

      // Add to local state
      setProducts((prev) => [...prev, productData as Product])

      // Reset form
      setNewProduct({
        name: "",
        price: "",
        category: "Kits",
        description: "",
        inStock: true,
      })
      setProductImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setIsAddProductOpen(false)

      toast({
        title: "Success",
        description: "Product added successfully",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingProduct(false)
    }
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Magnetar Shop</h1>
        <div className="flex items-center space-x-1">
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Add Product">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleNewProductChange}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-price">Price (PHP)</Label>
                  <Input
                    id="product-price"
                    name="price"
                    type="number"
                    value={newProduct.price}
                    onChange={handleNewProductChange}
                    placeholder="Enter price"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select value={newProduct.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="product-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat !== "All")
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleNewProductChange}
                    placeholder="Enter product description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-image">Product Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleProductImageChange}
                      className="flex-1"
                    />
                    {productImage && (
                      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={URL.createObjectURL(productImage) || "/placeholder.svg"}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddProduct} disabled={uploadingProduct}>
                  {uploadingProduct ? (
                    <>
                      <span className="mr-2">Uploading...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/shop/cart")}>
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      <div className="p-4 content-area">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 hide-scrollbar">
          {categories.map((category, index) => (
            <Badge
              key={index}
              variant={category === activeCategory ? "default" : "outline"}
              className="whitespace-nowrap cursor-pointer transition-all hover:scale-105"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-40 bg-gray-200 animate-pulse" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                      <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-40 object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
                          onClick={() => handleAddToFavorites(product.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center mb-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-xs text-gray-500">{product.rating}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{formatCurrency(product.price)}</span>
                          <Button
                            size="sm"
                            disabled={!product.inStock || addingToCart === product.id}
                            onClick={() => handleAddToCart(product)}
                          >
                            {addingToCart === product.id ? "Adding..." : "Add"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No products found matching your search</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setActiveCategory("All")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

