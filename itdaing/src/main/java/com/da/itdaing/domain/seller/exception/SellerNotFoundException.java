package com.da.itdaing.domain.seller.exception;

import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.BusinessException;

public class SellerNotFoundException extends BusinessException {

    public SellerNotFoundException(Long sellerId) {
        super(ErrorCode.USER_NOT_FOUND, "판매자를 찾을 수 없습니다. id=" + sellerId);
    }
}


