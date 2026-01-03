"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductDialog } from "./product-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/products";
import { useTransition } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  description: string | null;
  isAvailable: boolean;
}

export function ProductsTable({ products }: { products: Product[] }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: number) => {
        if(confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
            startTransition(async () => {
                await deleteProduct(id);
            });
        }
    };

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">المنتجات</h2>
            <ProductDialog />
        </div>
        
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        لا يوجد منتجات. قم بإضافة منتجك الأول.
                    </TableCell>
                </TableRow>
            ) : (
                products.map((product) => (
                <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="font-bold dir-ltr text-right">{Number(product.price).toFixed(2)}</TableCell>
                <TableCell className="text-gray-500 truncate max-w-[200px]">{product.description || "-"}</TableCell>
                <TableCell>
                    <Badge variant={product.isAvailable ? "default" : "secondary"}>
                        {product.isAvailable ? "متوفر" : "غير متوفر"}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                        <ProductDialog product={product} />
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} disabled={isPending}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                </TableCell>
                </TableRow>
            )))}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}

