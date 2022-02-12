USE [bryntum_scheduler]
GO

IF OBJECT_ID('dbo.events', 'U') IS NOT NULL
  DROP TABLE [dbo].[events];

IF OBJECT_ID('dbo.resources', 'U') IS NOT NULL
  DROP TABLE [dbo].[resources];

IF OBJECT_ID('dbo.options', 'U') IS NOT NULL
  DROP TABLE [dbo].[options];

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[events](
  [id] [int] IDENTITY(1,1) NOT NULL,
  [name] [varchar](255) NULL,
  [startDate] [datetime] NULL,
  [endDate] [datetime] NULL,
  [resourceId] [int] NOT NULL,
  [resizable] [bit] NOT NULL,
  [draggable] [bit] NOT NULL,
  [cls] [varchar](255) NULL,
 CONSTRAINT [PK_events] PRIMARY KEY CLUSTERED
(
  [id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[options](
  [name] [varchar](45) NOT NULL,
  [value] [varchar](45) NULL,
  [dt] [datetime] NULL,
 CONSTRAINT [PK_options] PRIMARY KEY CLUSTERED
(
  [name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[resources](
  [id] [int] IDENTITY(1,1) NOT NULL,
  [name] [varchar](255) NULL,
 CONSTRAINT [PK_resources] PRIMARY KEY CLUSTERED
(
  [id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
SET IDENTITY_INSERT [dbo].[events] ON
GO

INSERT [dbo].[events] ([id], [name], [startDate], [endDate], [resourceId], [resizable], [draggable], [cls]) VALUES
 (1, N'Consulting for Oracle', CAST(0x0000A0CD011826C0 AS DateTime), CAST(0x0000A0D000000000 AS DateTime), 1, 1, 1, N'')
,(2, N'Consulting for IBM', CAST(0x0000A0CB00A4CB80 AS DateTime), CAST(0x0000A0CD00000000 AS DateTime), 2, 1, 1, N'')
,(3, N'Recruit new manager', CAST(0x0000A0C900C5C100 AS DateTime), CAST(0x0000A0CC00000000 AS DateTime), 3, 1, 1, N'')
,(4, N'Paperwork', CAST(0x0000A0CE016A8C80 AS DateTime), CAST(0x0000A0D100000000 AS DateTime), 2, 1, 1, N'')
,(5, N'Holidays', CAST(0x0000A0C800107AC0 AS DateTime), CAST(0x0000A0CE017B0740 AS DateTime), 1, 1, 1, N'')
,(6, N'Work on the new technology', CAST(0x0000A0CC009450C0 AS DateTime), CAST(0x0000A0D2011826C0 AS DateTime), 4, 1, 1, N'')
,(7, N'Secret task', CAST(0x0000A0CC0062E080 AS DateTime), CAST(0x0000A0CC0107AC00 AS DateTime), 5, 1, 1, N'')
,(8, N'Prepare the list', CAST(0x0000A0CF00A4CB80 AS DateTime), CAST(0x0000A0D100000000 AS DateTime), 5, 1, 1, N'')
GO
SET IDENTITY_INSERT [dbo].[events] OFF
GO
INSERT [dbo].[options] ([name], [value], [dt]) VALUES (N'revision', N'1', NULL)
GO
SET IDENTITY_INSERT [dbo].[resources] ON
GO

INSERT [dbo].[resources] ([id], [name]) VALUES
 (1, N'Tom')
,(2, N'Mike')
,(3, N'Jerry')
,(4, N'Larry')
,(5, N'Tina')
,(6, N'Tony')
GO

SET IDENTITY_INSERT [dbo].[resources] OFF
GO
ALTER TABLE [dbo].[events] ADD  CONSTRAINT [DF_events_resizable]  DEFAULT ((1)) FOR [resizable]
GO
ALTER TABLE [dbo].[events] ADD  CONSTRAINT [DF_events_draggable]  DEFAULT ((1)) FOR [draggable]
GO
ALTER TABLE [dbo].[events]  WITH CHECK ADD  CONSTRAINT [FK_events_resources] FOREIGN KEY([resourceId])
REFERENCES [dbo].[resources] ([id])
GO
ALTER TABLE [dbo].[events] CHECK CONSTRAINT [FK_events_resources]
GO
