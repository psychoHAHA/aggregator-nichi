/** @typedef {import("jquery")} $ */

new (class Frontend {
	constructor() {
		$(() => {
            this.runMasks();
            this.validateInit();
		});
	}
    runMasks(){
		$('.js-phone-mask').inputmask({
			mask: '+7 (*99) 999-99-99',
			definitions: {
				'*': {
					validator: "[4,9]",
				}
			}
		})

		$('.js-digits-mask').inputmask({
			alias: 'currency',
			allowMinus: 'false',
			digits: '0',
			groupSeparator: ' ',
			rightAlign: false
		})

		$('.js-numeric-mask').inputmask({
			alias: 'numeric',
			allowMinus: 'false',
			rightAlign: false
		})
	}
    validateInit() {
        jQuery.validator.addMethod('agreementValidator', function(value, element) {
            const isChecked = $(element).is(':checked');
            if (!isChecked) {
                $(element).closest('.agreement__wrapper').addClass('shake');
                return false;
            }
            $(element).closest('.agreement__wrapper').removeClass('shake');
            return true;
        });
		jQuery.validator.addMethod('ruPhone', function(phone_number, element) {
			function countDigits(str) {
				const regex = /\d/g;
				const matches = str.match(regex);

				if (matches) {
					return matches.length;
				} else {
					return 0;
				}
			}

			return countDigits(phone_number) >=11;
		});

		// Получение CSRF токена из метатега
		const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

		// Универсальная функция для выполнения AJAX-запросов
		function ajaxRequest(url, method, data, onSuccess, onError) {
			$.ajax({
				url: url,
				type: method,
				contentType: 'application/json',
				headers: { 'X-CSRF-TOKEN': csrfToken },
				data: JSON.stringify(data),
				success: onSuccess,
				error: onError || function(xhr, status, error) {
					console.error('Error:', status, error);
					//$.fancybox.open({ src: '#modal-msg-error' });
				}
			});
		}
		
		// Открытие капчи в модальном окне
		function openCaptchaModal(formData, formElement) {
			$.fancybox.open({
				src: '#captcha-modal',
				type: 'inline',
				opts: {
					afterShow: function() {
						if (window.smartCaptcha) {
							const container = $('.smart-captcha')[0];
							window.smartCaptcha.render(container, {
								sitekey: window.sitekey,
								hl: 'ru',
								callback: function(token) {
									ajaxRequest('/form/send/captcha', 'POST', { captcha: token }, function(data) {
										if (data.success) {
											submitForm(formData, formElement);
										} else {
											alert('Капча не прошла проверку: ' + data.message);
										}
									});
								}
							});
						}
					}
				}
			});
		}

		// Открытие капчи в модальном окне
		function openVerificate(formData, formElement) {      
			if (!window.verification) return false;
			const captcha = $('#captcha-number');
			const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
			
			if (!csrf) return console.error('CSRF токен не найден');

			const phone = formData.telephone;
			const cleanPhone = phone.replace(/[^\d]/g, '');
			const dataIdView = formElement.getAttribute('data-id');

			if (cleanPhone && cleanPhone.length === 11) {
				const formattedPhone = `+7 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-**-**`;
				document.querySelector('.captcha-number_text b').textContent = formattedPhone;
				// Отправка запроса для получения кода подтверждения через GET
				const url = `/form/call/send?phone=${encodeURIComponent(cleanPhone)}`;
	
				fetch(url, {
					method: 'GET',
					headers: {
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
					'X-XSRF-TOKEN': csrfToken,
					},
				})
					.then((response) => response.json())
					.then((data) => {
						if (data.success) {
							captcha.find('form').attr('data-view', dataIdView);
							$.fancybox.open({
								src: '#captcha-number',
								type: 'inline'
							});
							$('#captcha-number input:first').trigger('focus');
						} else {
							$.fancybox.close(true);
							$.fancybox.open({ src: '#thanks-popup' });
						}
					})
					.catch((error) => {
						console.log('Error Call:', error);
					});
			} else {
				console.log('Номер телефона не заполнен');
			}
		}

		function submitForm(formData, formElement) {
			ajaxRequest($(formElement).data('action'), $(formElement).data('method'), formData, function(response) {
				if (window.verification) return;

				eval(response.reachgoal);
		
				if ($(formElement).data('calculate-form-modal') !== undefined) {
					$(formElement).find('input[name="name"], input[name="telephone"]').val('');
				} else {
					$(formElement).trigger('reset');
				}

				if ($(formElement).hasClass("gift__form")) {
                    $(".modal-success__title").html(`Ваш выйгрыш "${$(".gift__result").first().text()}" успешно зафиксирован!`)
                    return setTimeout(() => {
                        $.fancybox.close(true);
                        $.fancybox.open({ src: '#thanks-popup' });
                    }, 1000);
                } else {
                    $(".modal-success__title").text(`Ваша заявка успешно отправлена!`)
                }
		
				$.fancybox.close(true);
		
				$.fancybox.open({ src: '#thanks-popup' });
			});
		}

		$('.js-form-validator').each(function() {
			$(this).validate({
				rules: {
                    license: {
                        agreementValidator: true,
                    },
					name: {
						required: true,
						minlength: 2
					},
					telephone: {
						required: true,
						minlength: 18,
						ruPhone: true
					},
					agreement: {
						required: true
					}
				},
				messages: {
					name: 'Поле должно быть заполнено',
					agreement: 'Поле должно быть заполнено',
					telephone: 'Номер телефона должен содержать 11 цифр'
				},
				submitHandler: function(form) {
					const $form = $(form);
					
					// Сбор данных формы в объект
					const formData = {};
					$form.serializeArray().forEach(function(field) {
						formData[field.name] = field.value;
					});
				
					if (window.verification === true) {
						submitForm(formData, form);
						openVerificate(formData, form);
					  } else if (window.captcha === true) {
						// Открытие капчи перед отправкой формы
						openCaptchaModal(formData, form);
					  } else {
						// Отправка формы без капчи
						submitForm(formData, form);
					  }
				
					return false;
				},
				errorElement: 'span'
			});
		});
	}
})();
