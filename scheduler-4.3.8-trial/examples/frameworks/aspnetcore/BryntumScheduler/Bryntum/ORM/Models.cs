using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Configuration;
using System.Text;

namespace Bryntum.Scheduler
{
    public class SchedulerContext : DbContext
    {
        private readonly string ConnectionString;

        public SchedulerContext(string connectionString)
        {
            ConnectionString = connectionString;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySql(ConnectionString);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Option>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("options");
            });

            modelBuilder.Entity<Resource>(entity =>
            {
                entity.ToTable("resources");

                entity.HasKey(e => e.Id);

                entity.Ignore(e => e.PhantomId);
                entity.Ignore(e => e.PhantomIdField);

                entity.Property(e => e.Id).HasColumnName("Id");
                entity.Property(e => e.Name).HasColumnName("Name");
            });

            modelBuilder.Entity<Event>(entity =>
            {
                entity.ToTable("events");

                entity.HasKey(e => e.Id);

                entity.Ignore(e => e.PhantomId);
                entity.Ignore(e => e.PhantomIdField);
                entity.Ignore(e => e.PhantomResourceId);
                entity.Ignore(e => e.ResourceId);

                entity.Property(e => e.Id).HasColumnName("Id");
                entity.Property(e => e.Name).HasColumnName("Name");
                entity.Property(e => e.StartDate).HasColumnName("StartDate");
                entity.Property(e => e.EndDate).HasColumnName("EndDate");
                entity.Property(e => e.resourceId).HasColumnName("ResourceId");
                entity.Property(e => e.Draggable).HasColumnName("Draggable");
                entity.Property(e => e.Resizable).HasColumnName("Resizable");
                entity.Property(e => e.Cls).HasColumnName("Cls");

                entity.HasOne(e => e.Resource).WithMany(r => r.events).HasForeignKey(e => e.resourceId);
            });
        }

        public DbSet<Resource> Resources { get; set; }

        public DbSet<Event> Events { get; set; }

        public DbSet<Option> Options { get; set; }
    }

    public partial class Resource
    {
        public Resource()
        {
            events = new HashSet<Event>();
        }

        public override int Id { get; set; }

        public string Name { get; set; }

        public virtual ICollection<Event> events { get; set; }
    }

    public partial class Event
    {
        public Event()
        {
            Draggable = true;
            Resizable = true;
        }

        public int resourceId { get; set; }

        public override int Id { get; set; }

        public string Name { get; set; }

        public Nullable<DateTime> StartDate { get; set; }

        public Nullable<DateTime> EndDate { get; set; }

        public bool Resizable { get; set; }

        public bool Draggable { get; set; }

        public string Cls { get; set; }

        public virtual Resource Resource { get; set; }
    }

    public class Option
    {
        public string Name { get; set; }

        public string Value { get; set; }

        public Nullable<DateTime> dt { get; set; }
    }
}
