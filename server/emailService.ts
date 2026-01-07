// Email service using Resend
import { getUncachableResendClient, isResendConfigured } from './resendClient';
import { formatPrice, CATEGORY_META, type Order, type DeckConfig } from '@shared/schema';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@deckbuilder.com';

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  try {
    const configured = await isResendConfigured();
    if (!configured) {
      console.log('Resend not configured, skipping email');
      return false;
    }

    const { client, fromEmail } = await getUncachableResendClient();
    const deckConfig = order.deckConfig as DeckConfig;

    const categoryBreakdown = Object.entries(deckConfig.counts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => {
        const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];
        return `${meta?.label || category}: ${count} cards`;
      })
      .join('\n');

    await client.emails.send({
      from: fromEmail,
      to: order.shippingEmail,
      subject: `Order Confirmed - DeckBuilder #${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank You for Your Order!</h1>
          <p>Hi ${order.shippingName},</p>
          <p>Your custom conversation deck is being prepared. Here are your order details:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order #${order.id.slice(0, 8).toUpperCase()}</h2>
            <p><strong>Quantity:</strong> ${order.quantity} deck${order.quantity > 1 ? 's' : ''}</p>
            <p><strong>Total:</strong> ${formatPrice(order.totalAmount)}</p>
            <p><strong>Card Back Design:</strong> ${deckConfig.cardBackDesign || 'Custom'}</p>
            
            <h3>Deck Composition</h3>
            <pre style="background: #fff; padding: 10px; border-radius: 4px;">${categoryBreakdown}</pre>
          </div>
          
          <h3>Shipping Address</h3>
          <p>
            ${order.shippingName}<br>
            ${order.shippingAddress}<br>
            ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}<br>
            ${order.shippingCountry}
          </p>
          
          <h3>What's Next?</h3>
          <ul>
            <li><strong>Production:</strong> 1-2 business days</li>
            <li><strong>Shipping:</strong> 3-5 business days</li>
          </ul>
          
          <p>You'll receive tracking information once your order ships.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Questions? Reply to this email or contact us at support@deckbuilder.com
          </p>
        </div>
      `,
    });

    console.log(`Order confirmation email sent to ${order.shippingEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

export async function sendAdminNotificationEmail(order: Order): Promise<boolean> {
  try {
    const configured = await isResendConfigured();
    if (!configured) {
      console.log('Resend not configured, skipping admin email');
      return false;
    }

    const { client, fromEmail } = await getUncachableResendClient();
    const deckConfig = order.deckConfig as DeckConfig;

    const categoryBreakdown = Object.entries(deckConfig.counts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => {
        const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];
        return `${meta?.label || category}: ${count}`;
      })
      .join(' | ');

    await client.emails.send({
      from: fromEmail,
      to: ADMIN_EMAIL,
      subject: `New Order! #${order.id.slice(0, 8).toUpperCase()} - ${formatPrice(order.totalAmount)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">New Order Received!</h1>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
            <h2 style="margin-top: 0; color: #166534;">Order #${order.id.slice(0, 8).toUpperCase()}</h2>
            <p><strong>Total:</strong> ${formatPrice(order.totalAmount)}</p>
            <p><strong>Quantity:</strong> ${order.quantity} deck${order.quantity > 1 ? 's' : ''}</p>
            <p><strong>Payment:</strong> ${order.paymentProvider || 'N/A'} - ${order.paymentReference || 'N/A'}</p>
          </div>
          
          <h3>Customer Details</h3>
          <p>
            <strong>Name:</strong> ${order.shippingName}<br>
            <strong>Email:</strong> ${order.shippingEmail}<br>
            <strong>Phone:</strong> ${order.shippingPhone || 'Not provided'}
          </p>
          
          <h3>Shipping Address</h3>
          <p>
            ${order.shippingAddress}<br>
            ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}<br>
            ${order.shippingCountry}
          </p>
          
          <h3>Deck Configuration</h3>
          <p><strong>Card Back:</strong> ${deckConfig.cardBackDesign || 'Custom'}</p>
          <p>${categoryBreakdown}</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.repl.co/admin` : '/admin'}" 
               style="background: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View in Admin
            </a>
          </p>
        </div>
      `,
    });

    console.log(`Admin notification email sent for order ${order.id}`);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return false;
  }
}

export async function sendOrderEmails(order: Order): Promise<void> {
  await Promise.all([
    sendOrderConfirmationEmail(order),
    sendAdminNotificationEmail(order),
  ]);
}
