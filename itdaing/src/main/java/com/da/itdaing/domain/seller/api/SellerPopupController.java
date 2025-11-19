package com.da.itdaing.domain.seller.api;

import com.da.itdaing.domain.popup.dto.PopupSummaryResponse;
import com.da.itdaing.domain.popup.service.PopupQueryService;
import com.da.itdaing.global.web.ApiResponse;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sellers/me")
@RequiredArgsConstructor
public class SellerPopupController {

    private final PopupQueryService popupQueryService;

    @GetMapping(value = "/popups", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<List<PopupSummaryResponse>> getMyPopups(Principal principal) {
        Long sellerId = Long.parseLong(principal.getName());
        List<PopupSummaryResponse> popups = popupQueryService.getPopupsBySeller(sellerId);
        return ApiResponse.success(popups);
    }
}
