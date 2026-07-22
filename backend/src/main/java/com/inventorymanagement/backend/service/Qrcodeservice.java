package com.inventorymanagement.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class Qrcodeservice {

    /**
     * Builds a upi://pay deep link and renders it as a QR code, returned as a
     * base64-encoded PNG string ready to drop into an <img src="data:image/png;base64,..."/>.
     *
     * @param upiId       the payee VPA, e.g. "rakshionagro@indianbank"
     * @param payeeName   the payee display name, e.g. "Rakshion Agro Solution"
     * @param amount      the EXACT invoice total as a raw number (not "₹62,482" — just 62482.00)
     * @param invoiceNo   used to populate the transaction note (tn) so the payment is identifiable
     * @return base64-encoded PNG bytes (no "data:image/png;base64," prefix — add that in the template)
     */
    public String generateUpiQrBase64(String upiId, String payeeName, BigDecimal amount, String invoiceNo)
            throws WriterException, IOException {

        String upiUri = "upi://pay"
                + "?pa=" + urlEncode(upiId)
                + "&pn=" + urlEncode(payeeName)
                + "&am=" + amount.setScale(2, java.math.RoundingMode.HALF_UP)
                + "&cu=INR"
                + "&tn=" + urlEncode("Invoice " + invoiceNo);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix bitMatrix = writer.encode(upiUri, BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);

        return Base64.getEncoder().encodeToString(baos.toByteArray());
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}