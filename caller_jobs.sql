
-- База данных: `caller_jobs`
--

-- --------------------------------------------------------

--
-- Структура таблицы `globalname`
--

CREATE TABLE `globalname` (
  `name` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `id` int(11) NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
)

-- --------------------------------------------------------

--
-- Структура таблицы `proxy`
--

CREATE TABLE `proxy` (
  `proxy` text NOT NULL,
  `comment` text DEFAULT NULL,
  `status` int(11) NOT NULL,
  `GlobalNameId` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL
) 

-- --------------------------------------------------------

--
-- Структура таблицы `proxyhistory`
--

CREATE TABLE `proxyhistory` (
  `proxy` text NOT NULL,
  `status` int(11) NOT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `id` int(11) NOT NULL
)

-- --------------------------------------------------------

--
-- Структура таблицы `thread`
--

CREATE TABLE `thread` (
  `GlobalNameId` int(11) NOT NULL,
  `number` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL
)

-- --------------------------------------------------------

--
-- Структура таблицы `urlphonetasks`
--

CREATE TABLE `urlphonetasks` (
  `Phone` text NOT NULL,
  `ProxyId` int(11) DEFAULT NULL,
  `url` text NOT NULL,
  `status` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `URLType` text DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `id` int(11) NOT NULL,
  `OperationTime` int(11) DEFAULT NULL,
  `GlobalNameId` int(11) DEFAULT NULL
)

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `globalname`
--
ALTER TABLE `globalname`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `proxy`
--
ALTER TABLE `proxy`
  ADD PRIMARY KEY (`id`),
  ADD KEY `GlobalNameId` (`GlobalNameId`);

--
-- Индексы таблицы `proxyhistory`
--
ALTER TABLE `proxyhistory`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `thread`
--
ALTER TABLE `thread`
  ADD PRIMARY KEY (`number`,`GlobalNameId`),
  ADD KEY `GlobalNameId` (`GlobalNameId`);

--
-- Индексы таблицы `urlphonetasks`
--
ALTER TABLE `urlphonetasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProxyId` (`ProxyId`),
  ADD KEY `GlobalNameId` (`GlobalNameId`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `globalname`
--
ALTER TABLE `globalname`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `proxy`
--
ALTER TABLE `proxy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `proxyhistory`
--
ALTER TABLE `proxyhistory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `urlphonetasks`
--
ALTER TABLE `urlphonetasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `proxy`
--
ALTER TABLE `proxy`
  ADD CONSTRAINT `proxy_ibfk_1` FOREIGN KEY (`GlobalNameId`) REFERENCES `globalname` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `thread`
--
ALTER TABLE `thread`
  ADD CONSTRAINT `thread_ibfk_1` FOREIGN KEY (`GlobalNameId`) REFERENCES `globalname` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `urlphonetasks`
--
ALTER TABLE `urlphonetasks`
  ADD CONSTRAINT `urlphonetasks_ibfk_1` FOREIGN KEY (`ProxyId`) REFERENCES `proxy` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `urlphonetasks_ibfk_2` FOREIGN KEY (`GlobalNameId`) REFERENCES `globalname` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
