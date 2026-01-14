import jsPDF from 'jspdf';
import { Order } from '@/types';

export const generateOrderPDF = (order: Order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Receipt', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #${order.id.slice(-8)}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Order Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Placed on: ${new Date(order.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    margin,
    yPosition
  );
  yPosition += 8;

  // Status
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${order.status}`, margin, yPosition);
  yPosition += 15;

  // Restaurant Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Restaurant Information', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  if (order.restaurant) {
    doc.text(`Name: ${order.restaurant.name}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Address: ${order.restaurant.address}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Cuisine: ${order.restaurant.cuisineType}`, margin + 5, yPosition);
    yPosition += 10;
  }

  // Order Items
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Items', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  order.items.forEach((item, index) => {
    checkPageBreak(20);
    
    // Item name
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${item.name}`, margin + 5, yPosition);
    yPosition += 6;

    // Quantity and price
    doc.setFont('helvetica', 'normal');
    doc.text(`   Quantity: ${item.quantity}`, margin + 5, yPosition);
    doc.text(`   Price: $${item.price.toFixed(2)} each`, margin + 60, yPosition);
    doc.text(`   Total: $${(item.price * item.quantity).toFixed(2)}`, margin + 120, yPosition);
    yPosition += 6;

    // Description if available
    if (item.menuItem?.description) {
      const description = doc.splitTextToSize(
        `   ${item.menuItem.description}`,
        pageWidth - margin * 2 - 10
      );
      doc.text(description, margin + 5, yPosition);
      yPosition += description.length * 5;
    }
    yPosition += 5;
  });

  // Delivery Information
  if (order.deliveryAddress) {
    checkPageBreak(25);
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Information', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Address: ${order.deliveryAddress}`, margin + 5, yPosition);
    yPosition += 6;

    if (order.deliveryLocation) {
      doc.text(
        `Coordinates: ${order.deliveryLocation.lat.toFixed(6)}, ${order.deliveryLocation.lng.toFixed(6)}`,
        margin + 5,
        yPosition
      );
      yPosition += 6;
    }
  }

  // Special Instructions
  if (order.specialInstructions) {
    checkPageBreak(20);
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Special Instructions', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const instructions = doc.splitTextToSize(
      order.specialInstructions,
      pageWidth - margin * 2 - 10
    );
    doc.text(instructions, margin + 5, yPosition);
    yPosition += instructions.length * 5;
  }

  // Order Summary
  checkPageBreak(30);
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Summary', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: $${order.totalAmount.toFixed(2)}`, margin + 5, yPosition);
  yPosition += 6;
  doc.text(`Delivery Fee: $0.00`, margin + 5, yPosition);
  yPosition += 6;
  doc.text(`Tax: $0.00`, margin + 5, yPosition);
  yPosition += 8;

  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${order.totalAmount.toFixed(2)}`, margin + 5, yPosition);
  yPosition += 10;

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Generated by FoodFinder',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  // Generate filename
  const filename = `Order-${order.id.slice(-8)}-${new Date(order.createdAt).toISOString().split('T')[0]}.pdf`;

  // Save the PDF
  doc.save(filename);
};
