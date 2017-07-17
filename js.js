/**
 * Created by Mello on 27.06.2017.
 */


//название ключа под которым хранятся данные
const KEY = 'key';

//наименования свойств
const columns = ['FIO', 'phone', 'email'];

//массив для сортировки
let sortMas = [];

/**
 * Функция парсинга из localStorage
 * @param storageKey   ключ localStorage
 */
const getData = function (storageKey) {
    return JSON.parse(localStorage.getItem(storageKey));
}

/**
 * удаляем старую таблицу и создаем новую
 * @param localArray массив объектов
 */
function createTable(localArray) {
    $('.content').html('');
    addRowsToTable(localArray);
}

/**
 * функция создания таблицы
 * @param localArray массив объектов
 */
function addRowsToTable(localArray) {
    for (let i = 0; i < localArray.length; i++) {
        let myList = $('<tr/>');
        for (let key in localArray[i]) {
            $('<td/>', {text: localArray[i][key]}).appendTo(myList);
        }
        $('.content').append(myList);
    }
}

/**
 * проверка входных данных
 * @param inputData
 */
function testInputData(inputData) {
    try {
        const data = JSON.parse(inputData);
        for (let key in data) {
            for (let key2 in data[key]) {
                if (typeof(data[key][key2]) !== 'String') {
                    String(data[key][key2]);
                }
            }
        }
    } catch (e) {
        alert('Ошибка входных данных');
        alert(e.name);
        alert(e.message);
    }
}

/**
 *  проверка вводимых данных и их добавление
 */
$('#addName').click(function () {


    /**
     * проверка полей ФИО и Телефон
     * @returns {boolean}
     */
    const checkField = function () {
        const fieldFio = $('#FIO').val(),
            fieldPhone = $('#phone').val();
        return fieldFio !== '' && fieldPhone !== '' ? true : false;
    }

    /**
     * проверка поля Email
     * @returns {boolean}
     */
    const checkEmail = function () {
        const fieldEmail = $('#email').val();
        const pattern = /^[a-z0-9_-]+@[a-z0-9-]+\.[a-z]{2,6}$/i;
        return fieldEmail.search(pattern) === 0 || fieldEmail === '' ? true : false;
    }

    if (checkField()) {
        if (($('#email').val() !== '' && checkEmail()) || $('#email').val() === '') {

            let enteredData = {
                FIO: $('#FIO').val(),
                phone: $('#phone').val(),
                email: $('#email').val()
            };

            const arr = getData(KEY);
            arr.push(enteredData);
            localStorage.setItem('key', JSON.stringify(arr));
            createTable(arr);

            $('#FIO').val('');
            $('#phone').val('');
            $('#email').val('');

        } else {
            alert('Не корректный Email');
            $('#email').attr('class', 'alertField');
            $('#email').focus(function () {
                $(this).removeClass('alertField');
            });
        }
    } else {
        alert('Поля ФИО и Телефон обязательны к заполнению');
        if ($('#FIO').val() === '') {
            $('#FIO').attr('class', 'alertField');
            $('#FIO').focus(function () {
                $(this).removeClass('alertField');
            });
        }
        if ($('#phone').val() === '') {
            $('#phone').attr('class', 'alertField');
            $('#phone').focus(function () {
                $(this).removeClass('alertField');
            });
        }
    }

});


/** проверяем localStorage, если в нем нет нашего ключа, то добавляем данные из JSON файла
 *
 * @param reference  callback строим таблицу если данные загрузились
 */
function phoneReference(reference) {

    if (!localStorage.getItem('key')) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'arrayNames.json', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                testInputData(xhr.responseText);
                localStorage.setItem('key', xhr.responseText);
                reference();
            }
        };
        xhr.send(null);
    } else {
        reference();
    }
}

phoneReference(function () {

    createTable(getData(KEY));

// создаем переменную в localStorage для сортировки списков по возрастанию и убыванию
    localStorage.setItem('orderSort', '1');

    const myTable = document.getElementById('myTable');
    myTable.onclick = function (e) {
        if (e.target.tagName !== 'TH') return;

        //сортируем если клик по заголовку
        sortTable(columns[e.target.cellIndex]);
    };

    /**
     * функция сортировки
     * @param colName наименование колонки
     */
    function sortTable(colName) {
        let order = localStorage.getItem('orderSort');
        const arr = sortMas.length === 0 ? getData(KEY) : sortMas;
        let glyph;
        arr.sort((item1, item2) => {
            const first = item1[colName];
            const second = item2[colName];
            let variableOne, variableTwo;

            //проверяем четность для сортировки в ту или иную сторону
            if (order % 2 === 0) {
                variableOne = -1;
                variableTwo = 1;
                glyph = 'glyphicon glyphicon-triangle-bottom';
            } else {
                variableOne = 1;
                variableTwo = -1;
                glyph = 'glyphicon glyphicon-triangle-top';
            }
            return first < second ? variableOne : variableTwo;
            return 0;
        });

        //создание и удаление glyphicon
        let column = colName === 'FIO' ? 0 : colName === 'phone' ? 1 : 2;
        for (let i = 0; i < 3; i++) {
            column === i ? $('#glyph' + i).attr('class', glyph) : $('#glyph' + i).removeClass();
        }
        order++;
        localStorage.setItem('orderSort', order);
        sortMas === 0 ? localStorage.setItem('key', JSON.stringify(arr)) : sortMas;
        createTable(arr);
    }

    /**
     * фильтрация
     */
    $(document).ready(function () {
        $('#filter').keyup(function () {
            let localData = getData(KEY);
            sortMas = [];
            const str = $(this).val().toLowerCase();
            localData.filter((item) => {
                for (let key in columns) {
                    const cellsVal = item[columns[key]];
                    if (String(cellsVal).toLowerCase().indexOf(str) !== -1) {
                        sortMas.push(item);
                        break;
                    }
                }
            });
            createTable(sortMas);
        });
    });
});
