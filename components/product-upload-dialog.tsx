"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { database, storage } from "@/lib/firebase-config"
import { ref as dbRef, push, set } from "firebase/database"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { Plus } from "lucide-react"

interface ProductUploadDialogProps {
  onProductAdded?: (product: any) => void
}

export function ProductUploadDialog({ onProductAdded }: ProductUploadDialogProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [uploadingProduct, setUploadingProduct] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = ["Kits", "Marketing", "Apparel", "Electronics", "Merchandise"]

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Kits",
    description: "",
    inStock: true,
  })
  const [productImage, setProductImage] = useState<File | null>(null)

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

      setIsOpen(false)

      // Notify parent component
      if (onProductAdded) {
        onProductAdded(productData)
      }

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                {categories.map((category) => (
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
  )
}

