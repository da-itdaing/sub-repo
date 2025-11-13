package com.da.itdaing.domain.popup.exception;

import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.BusinessException;

public class PopupNotFoundException extends BusinessException {
    public PopupNotFoundException(Long popupId) {
        super(ErrorCode.POPUP_NOT_FOUND, "팝업을 찾을 수 없습니다. id=" + popupId);
    }
}

